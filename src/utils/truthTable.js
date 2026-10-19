import {
  validateCircuit,
} from './validation.js';

import {
  simulateCircuit,
} from './circuitEngine.js';

const DEVELOPMENT_INPUT_LIMIT = 10;

function sortByName(a, b) {
  return a.data.name.localeCompare(
    b.data.name,
    undefined,
    {
      numeric: true,
    }
  );
}

export function generateTruthTable(
  nodes,
  edges,
  revision
) {
  const validation =
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

  const inputs = [
    ...validation.activeInputNodes,
  ].sort(sortByName);

  const outputs = [
    ...validation.outputs,
  ].sort(sortByName);

  if (
    inputs.length >
    DEVELOPMENT_INPUT_LIMIT
  ) {
    throw new Error(
      `El circuito supera el límite provisional de ${DEVELOPMENT_INPUT_LIMIT} entradas.`
    );
  }

  const combinations =
    2 ** inputs.length;

  const rows = [];

  for (
    let combination = 0;
    combination < combinations;
    combination++
  ) {
    const binaryValues =
      inputs.map(
        (_, index) => {
          const shift =
            inputs.length -
            index -
            1;

          return (
            combination >> shift
          ) & 1;
        }
      );

    const inputValues = {};

    inputs.forEach(
      (input, index) => {
        inputValues[
          input.id
        ] =
          binaryValues[index];
      }
    );

    const simulation =
      simulateCircuit(
        nodes,
        edges,
        inputValues,
        validation
      );

    const outputValues =
      outputs.map(
        (output) =>
          simulation
            .outputValues[
              output.id
            ]
      );

    rows.push({
      inputValues:
        binaryValues,

      outputValues,
    });
  }

  return {
    revision,

    inputs:
      inputs.map(
        (node) => ({
          id: node.id,
          name:
            node.data.name,
        })
      ),

    outputs:
      outputs.map(
        (node) => ({
          id: node.id,
          name:
            node.data.name,
        })
      ),

    rows,
  };
}