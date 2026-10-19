import {
  validateCircuit,
  requiredInputHandles,
  getIncomingEdge,
} from './validation.js';

function sortByName(a, b) {
  return a.data.name.localeCompare(
    b.data.name,
    undefined,
    {
      numeric: true,
    }
  );
}

function formatExpression(ast) {
  switch (ast.type) {
    case 'INPUT':
      return ast.name;

    case 'NOT':
      return (
        `¬(${formatExpression(
          ast.operand
        )})`
      );

    case 'AND':
      return (
        `(${formatExpression(
          ast.left
        )} ∧ ${formatExpression(
          ast.right
        )})`
      );

    case 'OR':
      return (
        `(${formatExpression(
          ast.left
        )} ∨ ${formatExpression(
          ast.right
        )})`
      );

    case 'NAND':
      return (
        `¬(${formatExpression(
          ast.left
        )} ∧ ${formatExpression(
          ast.right
        )})`
      );

    case 'NOR':
      return (
        `¬(${formatExpression(
          ast.left
        )} ∨ ${formatExpression(
          ast.right
        )})`
      );

    case 'XOR':
      return (
        `(${formatExpression(
          ast.left
        )} ⊕ ${formatExpression(
          ast.right
        )})`
      );

    case 'XNOR':
      return (
        `¬(${formatExpression(
          ast.left
        )} ⊕ ${formatExpression(
          ast.right
        )})`
      );

    default:
      throw new Error(
        `Expresión no soportada: ${ast.type}`
      );
  }
}

export function evaluateExpressionAst(
  ast,
  inputValues
) {
  switch (ast.type) {
    case 'INPUT':
      return inputValues[
        ast.name
      ];

    case 'NOT':
      return (
        evaluateExpressionAst(
          ast.operand,
          inputValues
        ) === 1
      )
        ? 0
        : 1;

    case 'AND':
      return (
        evaluateExpressionAst(
          ast.left,
          inputValues
        ) === 1 &&
        evaluateExpressionAst(
          ast.right,
          inputValues
        ) === 1
      )
        ? 1
        : 0;

    case 'OR':
      return (
        evaluateExpressionAst(
          ast.left,
          inputValues
        ) === 1 ||
        evaluateExpressionAst(
          ast.right,
          inputValues
        ) === 1
      )
        ? 1
        : 0;

    case 'NAND':
      return (
        evaluateExpressionAst(
          ast.left,
          inputValues
        ) === 1 &&
        evaluateExpressionAst(
          ast.right,
          inputValues
        ) === 1
      )
        ? 0
        : 1;

    case 'NOR':
      return (
        evaluateExpressionAst(
          ast.left,
          inputValues
        ) === 0 &&
        evaluateExpressionAst(
          ast.right,
          inputValues
        ) === 0
      )
        ? 1
        : 0;

    case 'XOR':
      return (
        evaluateExpressionAst(
          ast.left,
          inputValues
        ) !==
        evaluateExpressionAst(
          ast.right,
          inputValues
        )
      )
        ? 1
        : 0;

    case 'XNOR':
      return (
        evaluateExpressionAst(
          ast.left,
          inputValues
        ) ===
        evaluateExpressionAst(
          ast.right,
          inputValues
        )
      )
        ? 1
        : 0;

    default:
      throw new Error(
        `No es posible evaluar ${ast.type}.`
      );
  }
}

export function generateBooleanExpressions(
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

  const memo = new Map();

  function buildAst(nodeId) {
    if (memo.has(nodeId)) {
      return memo.get(nodeId);
    }

    const node =
      validation.nodeMap.get(
        nodeId
      );

    if (
      node.data.kind ===
      'INPUT'
    ) {
      const ast = {
        type: 'INPUT',
        name: node.data.name,
      };

      memo.set(
        nodeId,
        ast
      );

      return ast;
    }

    if (
      node.data.kind ===
      'OUTPUT'
    ) {
      const edge =
        getIncomingEdge(
          edges,
          node.id,
          'in-0'
        );

      const ast =
        buildAst(
          edge.source
        );

      memo.set(
        nodeId,
        ast
      );

      return ast;
    }

    const handles =
      requiredInputHandles(
        node.data.kind
      );

    const operands =
      handles.map(
        (handleId) => {
          const edge =
            getIncomingEdge(
              edges,
              node.id,
              handleId
            );

          return buildAst(
            edge.source
          );
        }
      );

    let ast;

    if (
      node.data.kind ===
      'NOT'
    ) {
      ast = {
        type: 'NOT',
        operand: operands[0],
      };
    } else {
      ast = {
        type:
          node.data.kind,

        left:
          operands[0],

        right:
          operands[1],
      };
    }

    memo.set(
      nodeId,
      ast
    );

    return ast;
  }

  const outputs = [
    ...validation.outputs,
  ].sort(sortByName);

  const expressions =
    outputs.map(
      (output) => {
        const ast =
          buildAst(
            output.id
          );

        return {
          outputId:
            output.id,

          outputName:
            output.data.name,

          expression:
            formatExpression(
              ast
            ),

          ast,
        };
      }
    );

  return {
    revision,
    expressions,
  };
}