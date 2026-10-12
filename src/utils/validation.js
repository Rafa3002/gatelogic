export const GATE_KINDS = [
  'AND',
  'OR',
  'NOT',
  'NAND',
  'NOR',
  'XOR',
  'XNOR',
];

export function requiredInputHandles(kind) {
  if (kind === 'NOT') {
    return ['in-0'];
  }

  if (GATE_KINDS.includes(kind)) {
    return ['in-0', 'in-1'];
  }

  if (kind === 'OUTPUT') {
    return ['in-0'];
  }

  return [];
}

export function getIncomingEdges(
  edges,
  nodeId,
  handleId
) {
  return edges.filter(
    (edge) =>
      edge.target === nodeId &&
      edge.targetHandle === handleId
  );
}

export function getIncomingEdge(
  edges,
  nodeId,
  handleId
) {
  return getIncomingEdges(
    edges,
    nodeId,
    handleId
  )[0];
}

function createError(
  code,
  message,
  nodeId = null,
  edgeId = null,
  relatedNodeIds = []
) {
  return {
    code,
    message,
    nodeId,
    edgeId,
    relatedNodeIds,
  };
}

export function validateCircuit(
  nodes,
  edges
) {
  const errors = [];
  const warnings = [];

  if (nodes.length === 0) {
    errors.push(
      createError(
        'VAL-000',
        'El área de trabajo se encuentra vacía.'
      )
    );

    return {
      isValid: false,
      errors,
      warnings,
      topologicalOrder: [],
      activeNodes: [],
      activeInputNodes: [],
      outputs: [],
      nodeMap: new Map(),
    };
  }

  /*
   * ------------------------------------------------
   * 1. IDENTIFICADORES
   * ------------------------------------------------
   */

  const ids = new Set();

  for (const node of nodes) {
    if (ids.has(node.id)) {
      errors.push(
        createError(
          'VAL-010',
          `El componente ${node.data.name} posee un identificador duplicado.`,
          node.id
        )
      );
    }

    ids.add(node.id);
  }

  const nodeMap = new Map(
    nodes.map((node) => [
      node.id,
      node,
    ])
  );

  /*
   * ------------------------------------------------
   * 2. TIPOS DE COMPONENTES
   * ------------------------------------------------
   */

  for (const node of nodes) {
    const kind = node.data.kind;

    const supported =
      kind === 'INPUT' ||
      kind === 'OUTPUT' ||
      GATE_KINDS.includes(kind);

    if (!supported) {
      errors.push(
        createError(
          'VAL-002',
          `El componente ${node.data.name} no pertenece al catálogo soportado.`,
          node.id
        )
      );
    }
  }

  /*
   * ------------------------------------------------
   * 3. VALIDACIÓN DE CONEXIONES
   * ------------------------------------------------
   */

  for (const edge of edges) {
    const source =
      nodeMap.get(edge.source);

    const target =
      nodeMap.get(edge.target);

    if (!source || !target) {
      errors.push(
        createError(
          'VAL-001',
          'Existe una conexión que referencia un componente inexistente.',
          null,
          edge.id
        )
      );

      continue;
    }

    if (
      source.data.kind === 'OUTPUT'
    ) {
      errors.push(
        createError(
          'VAL-003',
          `${source.data.name} es una salida final y no puede originar conexiones.`,
          source.id,
          edge.id
        )
      );
    }

    if (
      target.data.kind === 'INPUT'
    ) {
      errors.push(
        createError(
          'VAL-003',
          `${target.data.name} es una entrada independiente y no puede recibir señales.`,
          target.id,
          edge.id
        )
      );
    }

    if (
      edge.source === edge.target
    ) {
      errors.push(
        createError(
          'VAL-006',
          `${source.data.name} no puede conectarse consigo mismo.`,
          source.id,
          edge.id
        )
      );
    }

    if (
      edge.sourceHandle !== 'out'
    ) {
      errors.push(
        createError(
          'VAL-003',
          `La conexión originada en ${source.data.name} utiliza un puerto de salida incorrecto.`,
          source.id,
          edge.id
        )
      );
    }

    const allowedHandles =
      requiredInputHandles(
        target.data.kind
      );

    if (
      !allowedHandles.includes(
        edge.targetHandle
      )
    ) {
      errors.push(
        createError(
          'VAL-003',
          `La conexión hacia ${target.data.name} utiliza un puerto incompatible.`,
          target.id,
          edge.id
        )
      );
    }
  }

  /*
   * ------------------------------------------------
   * 4. MÚLTIPLES ORÍGENES
   * ------------------------------------------------
   */

  for (const node of nodes) {
    for (
      const handle of
      requiredInputHandles(
        node.data.kind
      )
    ) {
      const incoming =
        getIncomingEdges(
          edges,
          node.id,
          handle
        );

      if (incoming.length > 1) {
        errors.push(
          createError(
            'VAL-005',
            `${node.data.name} posee más de una señal conectada al mismo puerto de entrada.`,
            node.id
          )
        );
      }
    }
  }

  /*
   * ------------------------------------------------
   * 5. SALIDAS
   * ------------------------------------------------
   */

  const outputs = nodes.filter(
    (node) =>
      node.data.kind === 'OUTPUT'
  );

  if (outputs.length === 0) {
    errors.push(
      createError(
        'VAL-009',
        'El circuito debe poseer al menos una salida observable.'
      )
    );
  }

  /*
   * ------------------------------------------------
   * 6. DETERMINAR COMPONENTES ACTIVOS
   * ------------------------------------------------
   */

  const activeIds = new Set();

  function markActive(nodeId) {
    if (activeIds.has(nodeId)) {
      return;
    }

    const node = nodeMap.get(nodeId);

    if (!node) {
      return;
    }

    activeIds.add(nodeId);

    if (
      node.data.kind === 'INPUT'
    ) {
      return;
    }

    for (
      const handle of
      requiredInputHandles(
        node.data.kind
      )
    ) {
      const incoming =
        getIncomingEdges(
          edges,
          node.id,
          handle
        );

      for (const edge of incoming) {
        markActive(edge.source);
      }
    }
  }

  outputs.forEach((output) =>
    markActive(output.id)
  );

  const activeNodes =
    nodes.filter((node) =>
      activeIds.has(node.id)
    );

  const activeInputNodes =
    activeNodes.filter(
      (node) =>
        node.data.kind === 'INPUT'
    );

  if (
    outputs.length > 0 &&
    activeInputNodes.length === 0
  ) {
    errors.push(
      createError(
        'VAL-008',
        'El circuito no posee entradas independientes conectadas a las salidas.'
      )
    );
  }

  /*
   * ------------------------------------------------
   * 7. PUERTOS OBLIGATORIOS
   * ------------------------------------------------
   */

  for (const node of activeNodes) {
    if (
      node.data.kind === 'INPUT'
    ) {
      continue;
    }

    for (
      const handle of
      requiredInputHandles(
        node.data.kind
      )
    ) {
      const incoming =
        getIncomingEdges(
          edges,
          node.id,
          handle
        );

      if (incoming.length === 0) {
        errors.push(
          createError(
            'VAL-004',
            `${node.data.name} posee una entrada obligatoria sin conexión.`,
            node.id
          )
        );
      }
    }
  }

  /*
   * ------------------------------------------------
   * 8. COMPONENTES NO UTILIZADOS
   * ------------------------------------------------
   */

  for (const node of nodes) {
    if (!activeIds.has(node.id)) {
      warnings.push({
        code: 'ADV-001',
        message:
          `${node.data.name} no participa en ninguna salida observable.`,
        nodeId: node.id,
      });
    }
  }

  /*
   * ------------------------------------------------
   * 9. ORDENAMIENTO TOPOLÓGICO
   * ------------------------------------------------
   */

  const activeGates =
    activeNodes.filter((node) =>
      GATE_KINDS.includes(
        node.data.kind
      )
    );

  const gateIds = new Set(
    activeGates.map(
      (node) => node.id
    )
  );

  const adjacency = new Map();
  const indegree = new Map();

  for (const gate of activeGates) {
    adjacency.set(
      gate.id,
      new Set()
    );

    indegree.set(
      gate.id,
      0
    );
  }

  for (const edge of edges) {
    if (
      gateIds.has(edge.source) &&
      gateIds.has(edge.target)
    ) {
      const destinations =
        adjacency.get(edge.source);

      /*
       * Una compuerta puede alimentar dos
       * entradas de otra. La dependencia
       * entre nodos se cuenta una sola vez.
       */
      if (
        !destinations.has(
          edge.target
        )
      ) {
        destinations.add(
          edge.target
        );

        indegree.set(
          edge.target,
          indegree.get(
            edge.target
          ) + 1
        );
      }
    }
  }

  const queue = [];

  for (
    const [gateId, degree]
    of indegree.entries()
  ) {
    if (degree === 0) {
      queue.push(gateId);
    }
  }

  const topologicalOrder = [];

  while (queue.length > 0) {
    const current =
      queue.shift();

    topologicalOrder.push(
      current
    );

    for (
      const destination of
      adjacency.get(current)
    ) {
      const newDegree =
        indegree.get(
          destination
        ) - 1;

      indegree.set(
        destination,
        newDegree
      );

      if (newDegree === 0) {
        queue.push(
          destination
        );
      }
    }
  }

  if (
    topologicalOrder.length !==
    activeGates.length
  ) {
    const cyclicIds =
      activeGates
        .map((gate) => gate.id)
        .filter(
          (id) =>
            !topologicalOrder.includes(
              id
            )
        );

    errors.push(
      createError(
        'VAL-006',
        'Se detectó una dependencia circular. GateLogic versión 1.0 únicamente admite circuitos combinacionales.',
        null,
        null,
        cyclicIds
      )
    );
  }

  return {
    isValid:
      errors.length === 0,

    errors,
    warnings,

    topologicalOrder,
    activeNodes,
    activeInputNodes,
    outputs,
    nodeMap,
  };
}

/*
 * Validación inmediata de una nueva conexión.
 */

function pathExists(
  start,
  destination,
  edges
) {
  const visited = new Set();
  const queue = [start];

  while (queue.length > 0) {
    const current =
      queue.shift();

    if (
      current === destination
    ) {
      return true;
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    const nextNodes =
      edges
        .filter(
          (edge) =>
            edge.source === current
        )
        .map(
          (edge) => edge.target
        );

    queue.push(...nextNodes);
  }

  return false;
}

export function checkNewConnection(
  nodes,
  edges,
  connection
) {
  const source =
    nodes.find(
      (node) =>
        node.id ===
        connection.source
    );

  const target =
    nodes.find(
      (node) =>
        node.id ===
        connection.target
    );

  if (!source || !target) {
    return {
      valid: false,
      code: 'VAL-001',
      message:
        'No se pudo identificar uno de los componentes de la conexión.',
    };
  }

  if (
    source.data.kind ===
    'OUTPUT'
  ) {
    return {
      valid: false,
      code: 'VAL-003',
      message:
        'Una salida final no puede originar una conexión.',
    };
  }

  if (
    target.data.kind === 'INPUT'
  ) {
    return {
      valid: false,
      code: 'VAL-003',
      message:
        'Una entrada independiente no puede recibir una conexión.',
    };
  }

  if (
    source.id === target.id
  ) {
    return {
      valid: false,
      code: 'VAL-006',
      message:
        'Un componente no puede conectarse consigo mismo.',
    };
  }

  if (
    connection.sourceHandle !==
    'out'
  ) {
    return {
      valid: false,
      code: 'VAL-003',
      message:
        'La conexión debe originarse desde un puerto de salida.',
    };
  }

  const allowedHandles =
    requiredInputHandles(
      target.data.kind
    );

  if (
    !allowedHandles.includes(
      connection.targetHandle
    )
  ) {
    return {
      valid: false,
      code: 'VAL-003',
      message:
        'El puerto de destino no es compatible.',
    };
  }

  const occupied =
    edges.some(
      (edge) =>
        edge.target ===
          connection.target &&
        edge.targetHandle ===
          connection.targetHandle
    );

  if (occupied) {
    return {
      valid: false,
      code: 'VAL-005',
      message:
        'El puerto seleccionado ya posee una señal de entrada.',
    };
  }

  const duplicated =
    edges.some(
      (edge) =>
        edge.source ===
          connection.source &&
        edge.target ===
          connection.target &&
        edge.sourceHandle ===
          connection.sourceHandle &&
        edge.targetHandle ===
          connection.targetHandle
    );

  if (duplicated) {
    return {
      valid: false,
      code: 'VAL-009',
      message:
        'La conexión seleccionada ya existe.',
    };
  }

  /*
   * Si actualmente existe un camino
   * target -> source, agregar
   * source -> target generaría un ciclo.
   */

  if (
    pathExists(
      target.id,
      source.id,
      edges
    )
  ) {
    return {
      valid: false,
      code: 'VAL-006',
      message:
        'La conexión generaría una dependencia circular. Los circuitos combinacionales no admiten retroalimentación.',
    };
  }

  return {
    valid: true,
    code: null,
    message:
      'Conexión válida.',
  };
}