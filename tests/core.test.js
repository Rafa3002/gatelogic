import test from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateGate,
  simulateCircuit,
} from '../src/utils/circuitEngine.js';

import {
  validateCircuit,
  checkNewConnection,
} from '../src/utils/validation.js';

import {
  generateTruthTable,
} from '../src/utils/truthTable.js';

import {
  generateBooleanExpressions,
} from '../src/utils/booleanExpression.js';

import {
  verifyEquivalence,
} from '../src/utils/equivalence.js';


function createNode(
  id,
  kind,
  name
) {
  return {
    id,

    data: {
      kind,
      name,
    },

    position: {
      x: 0,
      y: 0,
    },
  };
}


function createEdge(
  id,
  source,
  target,
  targetHandle,
  sourceHandle = 'out'
) {
  return {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
  };
}


function createAndCircuit() {
  const nodes = [
    createNode(
      'a',
      'INPUT',
      'A'
    ),

    createNode(
      'b',
      'INPUT',
      'B'
    ),

    createNode(
      'g',
      'AND',
      'AND1'
    ),

    createNode(
      'f',
      'OUTPUT',
      'F1'
    ),
  ];

  const edges = [
    createEdge(
      'e1',
      'a',
      'g',
      'in-0'
    ),

    createEdge(
      'e2',
      'b',
      'g',
      'in-1'
    ),

    createEdge(
      'e3',
      'g',
      'f',
      'in-0'
    ),
  ];

  return {
    nodes,
    edges,
  };
}


/*
 * =====================================
 * PRUEBAS DE COMPUERTAS
 * =====================================
 */

const binaryCases = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

const expectedOutputs = {
  AND: [
    0,
    0,
    0,
    1,
  ],

  OR: [
    0,
    1,
    1,
    1,
  ],

  NAND: [
    1,
    1,
    1,
    0,
  ],

  NOR: [
    1,
    0,
    0,
    0,
  ],

  XOR: [
    0,
    1,
    1,
    0,
  ],

  XNOR: [
    1,
    0,
    0,
    1,
  ],
};


for (
  const [
    kind,
    expected,
  ] of Object.entries(
    expectedOutputs
  )
) {
  test(
    `Compuerta ${kind}`,
    () => {
      binaryCases.forEach(
        (
          [a, b],
          index
        ) => {
          const result =
            evaluateGate(
              kind,
              [a, b]
            );

          assert.equal(
            result,
            expected[index]
          );
        }
      );
    }
  );
}


test(
  'Compuerta NOT',
  () => {
    assert.equal(
      evaluateGate(
        'NOT',
        [0]
      ),
      1
    );

    assert.equal(
      evaluateGate(
        'NOT',
        [1]
      ),
      0
    );
  }
);


/*
 * =====================================
 * VALIDACIÓN
 * =====================================
 */

test(
  'Un circuito AND completo debe ser válido',
  () => {
    const {
      nodes,
      edges,
    } =
      createAndCircuit();

    const validation =
      validateCircuit(
        nodes,
        edges
      );

    assert.equal(
      validation.isValid,
      true
    );

    assert.deepEqual(
      validation.topologicalOrder,
      ['g']
    );
  }
);


test(
  'Una entrada obligatoria desconectada debe generar error',
  () => {
    const {
      nodes,
      edges,
    } =
      createAndCircuit();

    const incompleteEdges =
      edges.filter(
        (edge) =>
          edge.id !== 'e2'
      );

    const validation =
      validateCircuit(
        nodes,
        incompleteEdges
      );

    assert.equal(
      validation.isValid,
      false
    );

    assert.ok(
      validation.errors.some(
        (error) =>
          error.code ===
          'VAL-004'
      )
    );
  }
);


test(
  'Un circuito sin salida observable debe ser inválido',
  () => {
    const nodes = [
      createNode(
        'a',
        'INPUT',
        'A'
      ),

      createNode(
        'g',
        'NOT',
        'NOT1'
      ),
    ];

    const edges = [
      createEdge(
        'e1',
        'a',
        'g',
        'in-0'
      ),
    ];

    const validation =
      validateCircuit(
        nodes,
        edges
      );

    assert.equal(
      validation.isValid,
      false
    );

    assert.ok(
      validation.errors.some(
        (error) =>
          error.code ===
          'VAL-009'
      )
    );
  }
);


test(
  'No se debe permitir un segundo origen sobre un puerto ocupado',
  () => {
    const nodes = [
      createNode(
        'a',
        'INPUT',
        'A'
      ),

      createNode(
        'b',
        'INPUT',
        'B'
      ),

      createNode(
        'g',
        'AND',
        'AND1'
      ),
    ];

    const edges = [
      createEdge(
        'e1',
        'a',
        'g',
        'in-0'
      ),
    ];

    const connection = {
      source: 'b',
      target: 'g',
      sourceHandle: 'out',
      targetHandle: 'in-0',
    };

    const result =
      checkNewConnection(
        nodes,
        edges,
        connection
      );

    assert.equal(
      result.valid,
      false
    );

    assert.equal(
      result.code,
      'VAL-005'
    );
  }
);


/*
 * =====================================
 * SIMULACIÓN
 * =====================================
 */

test(
  'La simulación AND con 1 y 1 debe producir 1',
  () => {
    const {
      nodes,
      edges,
    } =
      createAndCircuit();

    const result =
      simulateCircuit(
        nodes,
        edges,
        {
          a: 1,
          b: 1,
        }
      );

    assert.equal(
      result.outputValues.f,
      1
    );
  }
);


test(
  'La simulación AND con 1 y 0 debe producir 0',
  () => {
    const {
      nodes,
      edges,
    } =
      createAndCircuit();

    const result =
      simulateCircuit(
        nodes,
        edges,
        {
          a: 1,
          b: 0,
        }
      );

    assert.equal(
      result.outputValues.f,
      0
    );
  }
);


/*
 * =====================================
 * TABLA DE VERDAD
 * =====================================
 */

test(
  'La tabla de verdad AND debe contener cuatro combinaciones correctas',
  () => {
    const {
      nodes,
      edges,
    } =
      createAndCircuit();

    const table =
      generateTruthTable(
        nodes,
        edges,
        7
      );

    assert.equal(
      table.rows.length,
      4
    );

    assert.deepEqual(
      table.rows.map(
        (row) =>
          row.outputValues[0]
      ),
      [
        0,
        0,
        0,
        1,
      ]
    );

    assert.equal(
      table.revision,
      7
    );
  }
);


/*
 * =====================================
 * EXPRESIÓN
 * =====================================
 */

test(
  'El circuito AND debe generar una expresión equivalente',
  () => {
    const {
      nodes,
      edges,
    } =
      createAndCircuit();

    const result =
      generateBooleanExpressions(
        nodes,
        edges,
        7
      );

    assert.equal(
      result
        .expressions[0]
        .expression,
      '(A ∧ B)'
    );
  }
);


/*
 * =====================================
 * EQUIVALENCIA
 * =====================================
 */

test(
  'Tabla y expresión AND deben ser equivalentes',
  () => {
    const {
      nodes,
      edges,
    } =
      createAndCircuit();

    const table =
      generateTruthTable(
        nodes,
        edges,
        7
      );

    const expressions =
      generateBooleanExpressions(
        nodes,
        edges,
        7
      );

    const equivalence =
      verifyEquivalence(
        table,
        expressions
      );

    assert.equal(
      equivalence.isEquivalent,
      true
    );

    assert.equal(
      equivalence.mismatches.length,
      0
    );
  }
);