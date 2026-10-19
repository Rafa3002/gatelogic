import {
  validateCircuit,
  requiredInputHandles,
  getIncomingEdge,
} from './validation.js';

export function evaluateGate(
  kind,
  values
) {
  switch (kind) {
    case 'AND':
      return (
        values[0] === 1 &&
        values[1] === 1
      )
        ? 1
        : 0;

    case 'OR':
      return (
        values[0] === 1 ||
        values[1] === 1
      )
        ? 1
        : 0;

    case 'NOT':
      return values[0] === 1
        ? 0
        : 1;

    case 'NAND':
      return (
        values[0] === 1 &&
        values[1] === 1
      )
        ? 0
        : 1;

    case 'NOR':
      return (
        values[0] === 0 &&
        values[1] === 0
      )
        ? 1
        : 0;

    case 'XOR':
      return (
        values[0] !==
        values[1]
      )
        ? 1
        : 0;

    case 'XNOR':
      return (
        values[0] ===
        values[1]
      )
        ? 1
        : 0;

    default:
      throw new Error(
        `Compuerta no soportada: ${kind}`
      );
  }
}

export function simulateCircuit(
  nodes,
  edges,
  inputValues,
  previousValidation = null
) {
  const validation =
    previousValidation ??
    validateCircuit(
      nodes,
      edges
    );

  if (!validation.isValid) {
    throw new Error(
      validation.errors
        .map(
          (error) =>
            error.message
        )
        .join(' ')
    );
  }

  const nodeValues = {};

  /*
   * 1. Asignar entradas.
   */

  for (
    const input of
    validation.activeInputNodes
  ) {
    const value =
      inputValues[input.id];

    if (
      value !== 0 &&
      value !== 1
    ) {
      throw new Error(
        `La entrada ${input.data.name} no posee un valor binario válido.`
      );
    }

    nodeValues[input.id] =
      value;
  }

  /*
   * 2. Evaluar compuertas
   * siguiendo el orden topológico.
   */

  for (
    const gateId of
    validation.topologicalOrder
  ) {
    const gate =
      validation.nodeMap.get(
        gateId
      );

    const handles =
      requiredInputHandles(
        gate.data.kind
      );

    const values =
      handles.map(
        (handleId) => {
          const edge =
            getIncomingEdge(
              edges,
              gate.id,
              handleId
            );

          if (!edge) {
            throw new Error(
              `No existe señal para ${gate.data.name}.`
            );
          }

          const value =
            nodeValues[
              edge.source
            ];

          if (
            value !== 0 &&
            value !== 1
          ) {
            throw new Error(
              `No se pudo obtener una señal válida para ${gate.data.name}.`
            );
          }

          return value;
        }
      );

    nodeValues[gate.id] =
      evaluateGate(
        gate.data.kind,
        values
      );
  }

  /*
   * 3. Obtener salidas.
   */

  const outputValues = {};

  for (
    const output of
    validation.outputs
  ) {
    const edge =
      getIncomingEdge(
        edges,
        output.id,
        'in-0'
      );

    if (!edge) {
      throw new Error(
        `${output.data.name} no posee una señal de origen.`
      );
    }

    const value =
      nodeValues[
        edge.source
      ];

    if (
      value !== 0 &&
      value !== 1
    ) {
      throw new Error(
        `No se pudo calcular ${output.data.name}.`
      );
    }

    nodeValues[output.id] =
      value;

    outputValues[output.id] =
      value;
  }

  return {
    nodeValues,
    outputValues,
    validation,
  };
}