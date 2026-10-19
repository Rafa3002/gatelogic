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
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import LogicNode
  from './nodes/LogicNode';

import Sidebar
  from './components/Sidebar';

import AnalysisPanel
  from './components/AnalysisPanel';

import FeedbackPanel
  from './components/FeedbackPanel';

import WorkspaceDock
  from './components/WorkspaceDock';

import {
  buildCircuitModel,
} from './utils/circuitModel';

import {
  validateCircuit,
  checkNewConnection,
} from './utils/validation';

import {
  simulateCircuit,
} from './utils/circuitEngine';

import {
  generateTruthTable,
} from './utils/truthTable';

import {
  generateBooleanExpressions,
} from './utils/booleanExpression';

import {
  verifyEquivalence,
} from './utils/equivalence';

const nodeTypes = {
  logicNode: LogicNode,
};

import LearningPanel
  from './components/LearningPanel';

import {
  learningActivities,
} from './utils/learningActivities';

function createEmptyAnalysis() {
  return {
    status: 'SIN_GENERAR',
    revision: null,
    truthTable: null,
    expressionResult: null,
    equivalence: null,
    error: '',
  };
}

function createEmptySimulation() {
  return {
    status: 'SIN_GENERAR',
    revision: null,
    result: null,
    error: '',
  };
}

function nextInputName(nodes) {
  const used = new Set(
    nodes
      .filter(
        (node) =>
          node.data.kind ===
          'INPUT'
      )
      .map(
        (node) =>
          node.data.name
      )
  );

  for (
    let index = 0;
    index < 26;
    index++
  ) {
    const name =
      String.fromCharCode(
        65 + index
      );

    if (!used.has(name)) {
      return name;
    }
  }

  let number = 1;

  while (
    used.has(`I${number}`)
  ) {
    number++;
  }

  return `I${number}`;
}

function nextOutputName(nodes) {
  const used = new Set(
    nodes
      .filter(
        (node) =>
          node.data.kind ===
          'OUTPUT'
      )
      .map(
        (node) =>
          node.data.name
      )
  );

  let number = 1;

  while (
    used.has(`F${number}`)
  ) {
    number++;
  }

  return `F${number}`;
}

function nextGateName(
  nodes,
  kind
) {
  const used = new Set(
    nodes
      .filter(
        (node) =>
          node.data.kind ===
          kind
      )
      .map(
        (node) =>
          node.data.name
      )
  );

  let number = 1;

  while (
    used.has(
      `${kind}${number}`
    )
  ) {
    number++;
  }

  return `${kind}${number}`;
}

function createComponent(
  kind,
  nodes
) {
  let name;

  if (kind === 'INPUT') {
    name =
      nextInputName(nodes);
  } else if (
    kind === 'OUTPUT'
  ) {
    name =
      nextOutputName(nodes);
  } else {
    name =
      nextGateName(
        nodes,
        kind
      );
  }

  return {
    id:
      crypto.randomUUID(),

    type:
      'logicNode',

    position: {
      x:
        150 +
        (nodes.length % 4) *
          160,

      y:
        80 +
        Math.floor(
          nodes.length / 4
        ) *
          120,
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

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  const [
    revision,
    setRevision,
  ] = useState(0);

  const [
    inputValues,
    setInputValues,
  ] = useState({});

  const [
    validationResult,
    setValidationResult,
  ] = useState(null);

  const [
    dockOpen,
    setDockOpen,
  ] = useState(false);

  const [
    dockTab,
    setDockTab,
  ] = useState('results');

  const [
    simulationLive,
    setSimulationLive,
  ] = useState(false);

  const [
    selectedActivityId,
    setSelectedActivityId,
  ] = useState(null);

  const [
    activityResult,
    setActivityResult,
  ] = useState(null);

  const [
    simulation,
    setSimulation,
  ] = useState(
    createEmptySimulation()
  );

  const [
    analysis,
    setAnalysis,
  ] = useState(
    createEmptyAnalysis()
  );

  const [
    message,
    setMessage,
  ] = useState(
    'Agrega componentes para comenzar.'
  );

  /*
   * Limpiar valores de entradas
   * eliminadas.
   */

  

  const markStructuralChange =
    useCallback(
      (text) => {
        setRevision(
          (value) =>
            value + 1
        );

        setValidationResult(
          null
        );

        setActivityResult(null);

        setSimulation(
          (current) => {
            if (simulationLive) {
              return {
                ...current,
                status: 'PROCESANDO',
              };
            }

            if (current.result) {
              return {
                ...current,
                status: 'DESACTUALIZADO',
              };
            }

            return createEmptySimulation();
          }
        );

        setAnalysis(
          (current) => {
            if (
              current.truthTable ||
              current.expressionResult
            ) {
              return {
                ...current,
                status: 'DESACTUALIZADO',
              };
            }

            return createEmptyAnalysis();
          }
        );

        setMessage(
          simulationLive
            ? `${text} La simulación en vivo se actualizará automáticamente.`
            : text
        );
      },
      [simulationLive]
    );

  /*
   * --------------------------------------------
   * AGREGAR COMPONENTE
   * --------------------------------------------
   */

  const addComponent =
    useCallback(
      (kind) => {
        const newNode =
          createComponent(
            kind,
            nodes
          );

        setNodes(
          (current) => [
            ...current,
            newNode,
          ]
        );

        if (
          kind === 'INPUT'
        ) {
          setInputValues(
            (current) => ({
              ...current,
              [newNode.id]: 0,
            })
          );
        }

        markStructuralChange(
          `Componente ${newNode.data.name} agregado.`
        );
      },
      [
        nodes,
        setNodes,
        markStructuralChange,
      ]
    );

  /*
   * --------------------------------------------
   * CONEXIONES
   * --------------------------------------------
   */

  const connectionCheck =
    useCallback(
      (connection) =>
        checkNewConnection(
          nodes,
          edges,
          connection
        ),
      [
        nodes,
        edges,
      ]
    );

  const isValidConnection =
    useCallback(
      (connection) =>
        connectionCheck(
          connection
        ).valid,
      [
        connectionCheck,
      ]
    );

  const onConnect =
    useCallback(
      (connection) => {
        const check =
          connectionCheck(
            connection
          );

        if (!check.valid) {
          setMessage(
            `${check.code}: ${check.message}`
          );

          return;
        }

        setEdges(
          (current) =>
            addEdge(
              {
                ...connection,
                type:
                  'smoothstep',
              },
              current
            )
        );

        markStructuralChange(
          'Conexión agregada correctamente.'
        );
      },
      [
        connectionCheck,
        setEdges,
        markStructuralChange,
      ]
    );

  /*
   * --------------------------------------------
   * CAMBIOS EN NODOS
   * --------------------------------------------
   */

  const onNodesChange =
    useCallback(
      (changes) => {
        onNodesChangeOriginal(
          changes
        );

        const removedIds =
          changes
            .filter(
              (change) =>
                change.type ===
                'remove'
            )
            .map(
              (change) =>
                change.id
            );

        if (removedIds.length > 0) {
          setInputValues(
            (current) => {
              const next = {
                ...current,
              };

              for (const id of removedIds) {
                delete next[id];
              }

              return next;
            }
          );

          markStructuralChange(
            'Componente eliminado. Los resultados anteriores dejaron de estar vigentes.'
          );
        }
      },
      [
        onNodesChangeOriginal,
        markStructuralChange,
      ]
    );

  /*
   * --------------------------------------------
   * CAMBIOS EN CONEXIONES
   * --------------------------------------------
   */

  const onEdgesChange =
    useCallback(
      (changes) => {
        onEdgesChangeOriginal(
          changes
        );

        const removed =
          changes.some(
            (change) =>
              change.type ===
              'remove'
          );

        if (removed) {
          markStructuralChange(
            'Conexión eliminada. Los resultados anteriores dejaron de estar vigentes.'
          );
        }
      },
      [
        onEdgesChangeOriginal,
        markStructuralChange,
      ]
    );

  /*
   * --------------------------------------------
   * REINICIO
   * --------------------------------------------
   */

  const clearWorkspace =
    useCallback(() => {
      if (
        nodes.length === 0 &&
        edges.length === 0
      ) {
        setMessage(
          'El área de trabajo ya se encuentra vacía.'
        );

        return;
      }

      const confirmed =
        window.confirm(
          '¿Deseas eliminar todo el circuito?'
        );

      if (!confirmed) {
        return;
      }

      setNodes([]);
      setEdges([]);
      setInputValues({});
      setValidationResult(null);
      setSimulationLive(false);

      setSimulation(
        createEmptySimulation()
      );

      setAnalysis(
        createEmptyAnalysis()
      );

      setRevision(
        (value) =>
          value + 1
      );

      setMessage(
        'Área de trabajo reiniciada.'
      );
    }, [
      nodes,
      edges,
      setNodes,
      setEdges,
    ]);

  /*
   * --------------------------------------------
   * ENTRADAS 0 / 1
   * --------------------------------------------
   */

  const toggleInput =
    useCallback(
      (inputId) => {
        setInputValues(
          (current) => ({
            ...current,

            [inputId]:
              current[inputId] === 1
                ? 0
                : 1,
          })
        );

        if (!simulationLive) {
          setSimulation(
            (current) =>
              current.result
                ? {
                    ...current,
                    status: 'DESACTUALIZADO',
                  }
                : current
          );
        }

        setMessage(
          simulationLive
            ? 'Entrada modificada. La simulación en vivo actualizará las señales automáticamente.'
            : 'Entrada modificada. Inicia la simulación para actualizar los estados.'
        );
      },
      [simulationLive]
    );

  /*
   * --------------------------------------------
   * VALIDAR
   * --------------------------------------------
   */

  const handleValidate =
    useCallback(() => {
      setDockOpen(true);
      setDockTab('results');

      const result =
        validateCircuit(
          nodes,
          edges
        );

      setValidationResult(
        result
      );

      if (result.isValid) {
        setMessage(
          `Circuito válido. ${result.warnings.length} advertencia(s).`
        );
      } else {
        setMessage(
          `Circuito inválido. Se detectaron ${result.errors.length} error(es).`
        );
      }
    }, [
      nodes,
      edges,
    ]);

  /*
   * --------------------------------------------
   * SIMULAR
   * --------------------------------------------
   */

  const executeSimulation =
    useCallback(() => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      const validation =
        validateCircuit(
          currentNodes,
          currentEdges
        );

      setValidationResult(
        validation
      );

      if (!validation.isValid) {
        setSimulation({
          status: 'ERROR',
          revision,
          result: null,
          error:
            validation.errors
              .map(
                (error) =>
                  error.message
              )
              .join(' '),
        });

        return false;
      }

      try {
        const result =
          simulateCircuit(
            currentNodes,
            currentEdges,
            inputValues,
            validation
          );

        setSimulation({
          status: 'VIGENTE',
          revision,
          result,
          error: '',
        });

        return true;
      } catch (error) {
        setSimulation({
          status: 'ERROR',
          revision,
          result: null,
          error: error.message,
        });

        return false;
      }
    }, [
      inputValues,
      revision,
    ]);

  const handleSimulation =
    useCallback(() => {
      setDockOpen(true);
      setDockTab('results');

      if (simulationLive) {
        setSimulationLive(false);
        setMessage(
          'Simulación en vivo pausada. Los últimos valores permanecerán visibles hasta que el circuito cambie.'
        );
        return;
      }

      setSimulationLive(true);
      setMessage(
        'Simulación en vivo iniciada. Los cambios de entradas y del circuito se recalcularán automáticamente.'
      );
    }, [simulationLive]);

  useEffect(() => {
      if (!simulationLive) {
        return;
      }

      executeSimulation();
    }, [
      simulationLive,
      executeSimulation,
    ]);

  /*
   * --------------------------------------------
   * ANÁLISIS INTEGRADO
   * --------------------------------------------
   */

  const handleAnalysis =
    useCallback(() => {
      setDockOpen(true);
      setDockTab('results');

      const validation =
        validateCircuit(
          nodes,
          edges
        );

      setValidationResult(
        validation
      );

      if (
        !validation.isValid
      ) {
        setAnalysis({
          ...createEmptyAnalysis(),

          status: 'ERROR',
          revision,

          error:
            validation.errors
              .map(
                (error) =>
                  error.message
              )
              .join(' '),
        });

        setMessage(
          'No es posible analizar un circuito inválido.'
        );

        return;
      }

      setAnalysis(
        (current) => ({
          ...current,
          status:
            'PROCESANDO',
          error: '',
        })
      );

      try {
        const truthTable =
          generateTruthTable(
            nodes,
            edges,
            revision
          );

        const expressionResult =
          generateBooleanExpressions(
            nodes,
            edges,
            revision
          );

        const equivalence =
          verifyEquivalence(
            truthTable,
            expressionResult
          );

        setAnalysis({
          status:
            equivalence
              .isEquivalent
              ? 'VIGENTE'
              : 'ERROR',

          revision,
          truthTable,
          expressionResult,
          equivalence,

          error:
            equivalence.error ??
            '',
        });

        if (
          equivalence
            .isEquivalent
        ) {
          setMessage(
            'Análisis integrado completado. Las representaciones son equivalentes.'
          );
        } else {
          setMessage(
            'Se detectó una inconsistencia lógica entre las representaciones.'
          );
        }
      } catch (error) {
        setAnalysis({
          ...createEmptyAnalysis(),

          status: 'ERROR',
          revision,
          error:
            error.message,
        });

        setMessage(
          'No fue posible completar el análisis.'
        );
      }
    }, [
      nodes,
      edges,
      revision,
    ]);

  /*
   * --------------------------------------------
   * NODOS CON ESTADO VISUAL
   * --------------------------------------------
   */

  const errorNodeIds =
    useMemo(() => {
      const ids = new Set();

      if (
        !validationResult
      ) {
        return ids;
      }

      for (
        const error of
        validationResult.errors
      ) {
        if (error.nodeId) {
          ids.add(
            error.nodeId
          );
        }

        for (
          const id of
          error.relatedNodeIds ??
          []
        ) {
          ids.add(id);
        }
      }

      return ids;
    }, [
      validationResult,
    ]);

  const simulationIsCurrent =
    simulation.status ===
      'VIGENTE' &&
    simulation.revision ===
      revision;

  const displayedNodes =
    useMemo(
      () =>
        nodes.map(
          (node) => ({
            ...node,

            data: {
              ...node.data,

              inputValue:
                inputValues[
                  node.id
                ] ?? 0,

              logicValue:
                simulationIsCurrent
                  ? simulation
                      .result
                      ?.nodeValues[
                        node.id
                      ]
                  : null,

              onToggleInput:
                toggleInput,

              hasError:
                errorNodeIds.has(
                  node.id
                ),
            },
          })
        ),
      [
        nodes,
        inputValues,
        simulationIsCurrent,
        simulation,
        toggleInput,
        errorNodeIds,
      ]
    );

  /*
   * --------------------------------------------
   * CONEXIONES CON ESTADO VISUAL
   * --------------------------------------------
   */

  const displayedEdges =
    useMemo(
      () =>
        edges.map(
          (edge) => {
            const signal =
              simulationIsCurrent
                ? simulation
                    .result
                    ?.nodeValues[
                      edge.source
                    ]
                : null;

            let signalClass =
              '';

            if (signal === 1) {
              signalClass =
                'signal-high-edge';
            } else if (
              signal === 0
            ) {
              signalClass =
                'signal-low-edge';
            }

            return {
              ...edge,

              className:
                signalClass,

              animated:
                signal === 1,
            };
          }
        ),
      [
        edges,
        simulationIsCurrent,
        simulation,
      ]
    );

  const model =
    useMemo(
      () =>
        buildCircuitModel(
          nodes,
          edges,
          revision
        ),
      [
        nodes,
        edges,
        revision,
      ]
    );

const handleSelectActivity =
  useCallback(
    (activityId) => {
      setDockOpen(true);
      setDockTab('learning');

      setSelectedActivityId(
        activityId
      );

      setActivityResult(
        null
      );

      setMessage(
        `Actividad ${activityId} seleccionada. Construye el circuito y comprueba tu solución.`
      );
    },
    []
  );

  const handleCheckActivity =
  useCallback(() => {
    const activity =
      learningActivities.find(
        (item) =>
          item.id ===
          selectedActivityId
      );

    if (!activity) {
      setActivityResult({
        success: false,

        message:
          'Selecciona una actividad antes de comprobar el circuito.',
      });

      return;
    }

    try {
      const table =
        generateTruthTable(
          nodes,
          edges,
          revision
        );

      if (
        table.inputs.length !==
        activity.expectedInputs
      ) {
        setActivityResult({
          success: false,

          message:
            `La actividad requiere ${activity.expectedInputs} entrada(s), pero tu circuito activo posee ${table.inputs.length}.`,
        });

        return;
      }

      if (
        table.outputs.length !==
        activity.expectedOutputs
      ) {
        setActivityResult({
          success: false,

          message:
            `La actividad requiere ${activity.expectedOutputs} salida(s), pero tu circuito posee ${table.outputs.length}.`,
        });

        return;
      }

      if (
        table.rows.length !==
        activity
          .expectedOutputRows
          .length
      ) {
        setActivityResult({
          success: false,

          message:
            'La cantidad de combinaciones no coincide con la actividad.',
        });

        return;
      }

      let allRowsMatch = true;

      for (
        let index = 0;
        index < table.rows.length;
        index++
      ) {
        const obtained =
          table.rows[
            index
          ].outputValues;

        const expected =
          activity
            .expectedOutputRows[
              index
            ];

        if (
          obtained.length !==
          expected.length
        ) {
          allRowsMatch =
            false;

          break;
        }

        for (
          let outputIndex = 0;
          outputIndex <
          expected.length;
          outputIndex++
        ) {
          if (
            obtained[
              outputIndex
            ] !==
            expected[
              outputIndex
            ]
          ) {
            allRowsMatch =
              false;

            break;
          }
        }

        if (!allRowsMatch) {
          break;
        }
      }

      if (allRowsMatch) {
        setActivityResult({
          success: true,

          message:
            'El comportamiento de tu circuito coincide con la función solicitada. Puedes continuar con la siguiente actividad.',
        });

        setMessage(
          `${activity.id} completada correctamente.`
        );
      } else {
        setActivityResult({
          success: false,

          message:
            'Tu circuito es válido, pero su tabla de verdad no coincide con la función solicitada. Revisa las compuertas y conexiones.',
        });
      }
    } catch (error) {
      setActivityResult({
        success: false,

        message:
          `No fue posible evaluar tu solución: ${error.message}`,
      });
    }
  }, [
    selectedActivityId,
    nodes,
    edges,
    revision,
  ]);

  return (
    <div className="app-layout">
      <Sidebar
        onAddComponent={
          addComponent
        }
        onClear={
          clearWorkspace
        }
        revision={
          revision
        }
      />

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <h2>
              Editor de circuitos
            </h2>

            <span>
              Componentes:{' '}
              {nodes.length}
              {' · '}
              Conexiones:{' '}
              {edges.length}
              {' · '}
              Revisión:{' '}
              {revision}
            </span>
          </div>

          <div className="header-right">
            <div className="header-actions">
              <button
                className="learning-action"
                onClick={() => {
                  if (
                    dockOpen &&
                    dockTab === 'learning'
                  ) {
                    setDockOpen(false);
                    return;
                  }

                  setDockOpen(true);
                  setDockTab('learning');
                }}
              >
                {dockOpen &&
                dockTab === 'learning'
                  ? 'Cerrar aprendizaje'
                  : 'Modo aprendizaje'}
              </button>
              <button
                className="validate-action"
                onClick={
                  handleValidate
                }
              >
                Validar
              </button>

              <button
                className={
                  simulationLive
                    ? 'simulate-action active'
                    : 'simulate-action'
                }
                onClick={
                  handleSimulation
                }
              >
                {simulationLive
                  ? 'Pausar simulación'
                  : 'Simular en vivo'}
              </button>

              <button
                className="primary-action"
                onClick={
                  handleAnalysis
                }
              >
                Analizar circuito
              </button>
            </div>

            <div className="status-message">
              {message}
            </div>
          </div>
        </header>

        <div className="flow-container">
          <ReactFlow
            nodes={displayedNodes}
            edges={displayedEdges}
            nodeTypes={nodeTypes}

            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}

            panOnDrag
            zoomOnPinch
            zoomOnDoubleClick={false}
            nodesDraggable
            nodesConnectable

            fitView
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background
              gap={20}
            />

            <Controls />

            <MiniMap />
          </ReactFlow>
        </div>


        <WorkspaceDock
          open={dockOpen}
          onOpenChange={setDockOpen}
          activeTab={dockTab}
          onTabChange={setDockTab}
          resultsContent={
            <div className="dock-results-stack">
              <FeedbackPanel
                validation={validationResult}
                simulation={simulation}
                simulationLive={simulationLive}
                nodes={nodes}
              />

              <AnalysisPanel
                analysis={analysis}
              />
            </div>
          }
          learningContent={
            <LearningPanel
              selectedActivityId={selectedActivityId}
              onSelectActivity={handleSelectActivity}
              onCheckActivity={handleCheckActivity}
              activityResult={activityResult}
            />
          }
          modelContent={
            <div className="dock-model-panel">
              <div className="dock-model-heading">
                <strong>Modelo interno del circuito</strong>
                <span>Revisión {revision}</span>
              </div>

              <pre>
                {JSON.stringify(
                  model,
                  null,
                  2
                )}
              </pre>
            </div>
          }
        />

      </main>
    </div>
  );
}