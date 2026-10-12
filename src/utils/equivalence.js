import {
  evaluateExpressionAst,
} from './booleanExpression';

export function verifyEquivalence(
  truthTable,
  expressionResult
) {
  if (
    truthTable.revision !==
    expressionResult.revision
  ) {
    return {
      isEquivalent: false,
      mismatches: [],
      error:
        'La tabla y la expresión pertenecen a revisiones diferentes del circuito.',
    };
  }

  const mismatches = [];

  for (
    const expression of
    expressionResult.expressions
  ) {
    const outputIndex =
      truthTable.outputs.findIndex(
        (output) =>
          output.id ===
          expression.outputId
      );

    if (outputIndex === -1) {
      return {
        isEquivalent: false,
        mismatches,
        error:
          `No se encontró la salida ${expression.outputName} en la tabla de verdad.`,
      };
    }

    truthTable.rows.forEach(
      (row, rowIndex) => {
        const inputValues = {};

        truthTable.inputs.forEach(
          (input, index) => {
            inputValues[
              input.name
            ] =
              row.inputValues[
                index
              ];
          }
        );

        const expressionValue =
          evaluateExpressionAst(
            expression.ast,
            inputValues
          );

        const expectedValue =
          row.outputValues[
            outputIndex
          ];

        if (
          expressionValue !==
          expectedValue
        ) {
          mismatches.push({
            row:
              rowIndex + 1,

            output:
              expression.outputName,

            expected:
              expectedValue,

            obtained:
              expressionValue,

            inputs:
              inputValues,
          });
        }
      }
    );
  }

  return {
    isEquivalent:
      mismatches.length === 0,

    mismatches,

    error:
      mismatches.length === 0
        ? null
        : 'Se detectaron diferencias entre la expresión y el comportamiento del circuito.',
  };
}