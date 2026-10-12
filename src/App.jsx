import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import LogicNode from './nodes/LogicNode';
import Sidebar from './components/Sidebar';
import { buildCircuitModel } from './utils/circuitModel';

const nodeTypes = {
  logicNode: LogicNode,
};

function nextInputName(nodes) {
  const count = nodes.filter(
    (node) => node.data.kind === 'INPUT'
  ).length;

  if (count < 26) {
    return String.fromCharCode(65 + count);
  }

  return `I${count + 1}`;
}

function nextOutputName(nodes) {
  const count = nodes.filter(
    (node) => node.data.kind === 'OUTPUT'
  ).length;

  return `F${count + 1}`;
}

function nextGateName(nodes, kind) {
  const count = nodes.filter(
    (node) => node.data.kind === kind
  ).length;

  return `${kind}${count + 1}`;
}

function createComponent(kind, nodes) {
  let name;

  if (kind === 'INPUT') {
    name = nextInputName(nodes);
  } else if (kind === 'OUTPUT') {
    name = nextOutputName(nodes);
  } else {
    name = nextGateName(nodes, kind);
  }

  return {
    id: crypto.randomUUID(),
    type: 'logicNode',

    position: {
      x: 150 + (nodes.length % 4) * 160,
      y: 80 + Math.floor(nodes.length / 4) * 120,
    },

    data: {
      kind,
      name,
    },
  };
}

export default function App() {
  const [
    nodes,
    setNodes,
    onNodesChangeOriginal,
  ] = useNodesState([]);

  const [
    edges,
    setEdges,
    onEdgesChangeOriginal,
  ] = useEdgesState([]);

  const [revision, setRevision] = useState(0);

  const [message, setMessage] = useState(
    'Agrega componentes para comenzar.'
  );

  const addComponent = useCallback(
    (kind) => {
      setNodes((currentNodes) => {
        const newNode =
          createComponent(kind, currentNodes);

        return [...currentNodes, newNode];
      });

      setRevision((value) => value + 1);

      setMessage(
        `Componente ${kind} agregado correctamente.`
      );
    },
    [setNodes]
  );

  const isValidConnection = useCallback(
    (connection) => {
      const sourceNode = nodes.find(
        (node) => node.id === connection.source
      );

      const targetNode = nodes.find(
        (node) => node.id === connection.target
      );

      if (!sourceNode || !targetNode) {
        return false;
      }

      // Una salida final no puede originar conexiones.
      if (sourceNode.data.kind === 'OUTPUT') {
        return false;
      }

      // Una entrada independiente no recibe señales.
      if (targetNode.data.kind === 'INPUT') {
        return false;
      }

      // No conectamos un elemento consigo mismo.
      if (connection.source === connection.target) {
        return false;
      }

      // Cada puerto de entrada admite un único origen.
      const targetAlreadyConnected = edges.some(
        (edge) =>
          edge.target === connection.target &&
          edge.targetHandle ===
            connection.targetHandle
      );

      if (targetAlreadyConnected) {
        return false;
      }

      // Evitar conexión idéntica duplicada.
      const duplicated = edges.some(
        (edge) =>
          edge.source === connection.source &&
          edge.sourceHandle ===
            connection.sourceHandle &&
          edge.target === connection.target &&
          edge.targetHandle ===
            connection.targetHandle
      );

      if (duplicated) {
        return false;
      }

      return true;
    },
    [nodes, edges]
  );

  const onConnect = useCallback(
    (connection) => {
      if (!isValidConnection(connection)) {
        setMessage(
          'Conexión inválida. Verifica los puertos seleccionados.'
        );

        return;
      }

      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
          },
          currentEdges
        )
      );

      setRevision((value) => value + 1);

      setMessage(
        'Conexión creada correctamente.'
      );
    },
    [isValidConnection, setEdges]
  );

  const onNodesChange = useCallback(
    (changes) => {
      onNodesChangeOriginal(changes);

      const structuralChange = changes.some(
        (change) => change.type === 'remove'
      );

      if (structuralChange) {
        setRevision((value) => value + 1);

        setMessage(
          'Componente eliminado. El circuito fue modificado.'
        );
      }
    },
    [onNodesChangeOriginal]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      onEdgesChangeOriginal(changes);

      const structuralChange = changes.some(
        (change) => change.type === 'remove'
      );

      if (structuralChange) {
        setRevision((value) => value + 1);

        setMessage(
          'Conexión eliminada. El circuito fue modificado.'
        );
      }
    },
    [onEdgesChangeOriginal]
  );

  const clearWorkspace = useCallback(() => {
    const hasElements =
      nodes.length > 0 || edges.length > 0;

    if (!hasElements) {
      setMessage(
        'El área de trabajo ya está vacía.'
      );

      return;
    }

    const confirmed = window.confirm(
      '¿Deseas eliminar todo el circuito?'
    );

    if (!confirmed) {
      return;
    }

    setNodes([]);
    setEdges([]);

    setRevision((value) => value + 1);

    setMessage(
      'Área de trabajo reiniciada.'
    );
  }, [
    nodes,
    edges,
    setNodes,
    setEdges,
  ]);

  const model = useMemo(
    () =>
      buildCircuitModel(
        nodes,
        edges,
        revision
      ),
    [nodes, edges, revision]
  );

  return (
    <div className="app-layout">
      <Sidebar
        onAddComponent={addComponent}
        onClear={clearWorkspace}
        revision={revision}
      />

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <h2>Editor de circuitos</h2>

            <span>
              Componentes: {nodes.length}
              {' · '}
              Conexiones: {edges.length}
            </span>
          </div>

          <div className="status-message">
            {message}
          </div>
        </header>

        <div className="flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={
              isValidConnection
            }
            fitView
            deleteKeyCode={[
              'Backspace',
              'Delete',
            ]}
          >
            <Background gap={20} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        <details className="model-panel">
          <summary>
            Ver modelo interno del circuito
          </summary>

          <pre>
            {JSON.stringify(model, null, 2)}
          </pre>
        </details>
      </main>
    </div>
  );
}