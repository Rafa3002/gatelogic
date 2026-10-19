export const learningActivities = [
  {
    id: 'ACT-01',
    title: 'Inversor lógico',
    level: 'Básico',

    objective:
      'Construye un circuito que produzca el valor contrario de la entrada A.',

    instructions:
      'Utiliza una entrada, una compuerta NOT y una salida.',

    hint:
      'La salida de NOT siempre debe ser el complemento de A.',

    expectedInputs: 1,
    expectedOutputs: 1,

    expectedOutputRows: [
      [1],
      [0],
    ],

    expectedExpression:
      'F = ¬A',
  },

  {
    id: 'ACT-02',
    title: 'Conjunción AND',
    level: 'Básico',

    objective:
      'Construye un circuito cuya salida sea 1 únicamente cuando A y B sean iguales a 1.',

    instructions:
      'Utiliza dos entradas, una compuerta AND y una salida.',

    hint:
      'Una AND únicamente produce 1 cuando todas sus entradas son 1.',

    expectedInputs: 2,
    expectedOutputs: 1,

    expectedOutputRows: [
      [0],
      [0],
      [0],
      [1],
    ],

    expectedExpression:
      'F = A ∧ B',
  },

  {
    id: 'ACT-03',
    title: 'Disyunción exclusiva',
    level: 'Intermedio',

    objective:
      'Construye un circuito que produzca 1 cuando A y B posean valores diferentes.',

    instructions:
      'La función solicitada corresponde al comportamiento XOR.',

    hint:
      'Comprueba qué sucede con 00, 01, 10 y 11.',

    expectedInputs: 2,
    expectedOutputs: 1,

    expectedOutputRows: [
      [0],
      [1],
      [1],
      [0],
    ],

    expectedExpression:
      'F = A ⊕ B',
  },

  {
    id: 'ACT-04',
    title: 'Circuito combinacional compuesto',
    level: 'Avanzado',

    objective:
      'Construye un circuito equivalente a F = (A ∧ B) ∨ ¬C.',

    instructions:
      'Utiliza tres entradas y combina las compuertas AND, NOT y OR.',

    hint:
      'Primero resuelve A AND B. Después invierte C y finalmente combina ambos resultados con OR.',

    expectedInputs: 3,
    expectedOutputs: 1,

    expectedOutputRows: [
      [1],
      [0],
      [1],
      [0],
      [1],
      [0],
      [1],
      [1],
    ],

    expectedExpression:
      'F = (A ∧ B) ∨ ¬C',
  },

  {
    id: 'ACT-05',
    title: 'Dos salidas',
    level: 'Avanzado',

    objective:
      'Construye un circuito con dos salidas: F1 = A ∧ B y F2 = A ∨ B.',

    instructions:
      'Las mismas entradas A y B deberán alimentar una compuerta AND y una compuerta OR.',

    hint:
      'Una señal de salida puede alimentar varios destinos en GateLogic.',

    expectedInputs: 2,
    expectedOutputs: 2,

    expectedOutputRows: [
      [0, 0],
      [0, 1],
      [0, 1],
      [1, 1],
    ],

    expectedExpression:
      'F1 = A ∧ B; F2 = A ∨ B',
  },
];

export const gateReference = [
  {
    kind: 'AND',
    name: 'Compuerta AND',
    description:
      'Produce 1 únicamente cuando todas sus entradas poseen valor 1.',

    expression:
      'F = A ∧ B',

    table: [
      [0, 0, 0],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
  },

  {
    kind: 'OR',
    name: 'Compuerta OR',
    description:
      'Produce 1 cuando al menos una de sus entradas posee valor 1.',

    expression:
      'F = A ∨ B',

    table: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
  },

  {
    kind: 'NOT',
    name: 'Compuerta NOT',
    description:
      'Produce el valor lógico contrario al valor recibido.',

    expression:
      'F = ¬A',

    table: [
      [0, 1],
      [1, 0],
    ],
  },

  {
    kind: 'NAND',
    name: 'Compuerta NAND',
    description:
      'Representa la negación de una operación AND.',

    expression:
      'F = ¬(A ∧ B)',

    table: [
      [0, 0, 1],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
    ],
  },

  {
    kind: 'NOR',
    name: 'Compuerta NOR',
    description:
      'Representa la negación de una operación OR.',

    expression:
      'F = ¬(A ∨ B)',

    table: [
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 0],
    ],
  },

  {
    kind: 'XOR',
    name: 'Compuerta XOR',
    description:
      'Produce 1 cuando sus entradas poseen valores diferentes.',

    expression:
      'F = A ⊕ B',

    table: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
    ],
  },

  {
    kind: 'XNOR',
    name: 'Compuerta XNOR',
    description:
      'Produce 1 cuando sus entradas poseen el mismo valor.',

    expression:
      'F = ¬(A ⊕ B)',

    table: [
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
];