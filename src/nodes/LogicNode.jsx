import { Handle, Position } from '@xyflow/react';

const gateSymbols = {
  INPUT: 'IN',
  OUTPUT: 'OUT',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  NAND: 'NAND',
  NOR: 'NOR',
  XOR: 'XOR',
  XNOR: 'XNOR',
};

function InputHandle({ id, top }) {
  return (
    <Handle
      type="target"
      position={Position.Left}
      id={id}
      style={{ top }}
    />
  );
}

export default function LogicNode({ data }) {
  const { kind, name } = data;

  if (kind === 'INPUT') {
    return (
      <div className="logic-node input-node">
        <div className="node-name">{name}</div>
        <div className="node-type">Entrada</div>

        <Handle
          type="source"
          position={Position.Right}
          id="out"
        />
      </div>
    );
  }

  if (kind === 'OUTPUT') {
    return (
      <div className="logic-node output-node">
        <Handle
          type="target"
          position={Position.Left}
          id="in-0"
        />

        <div className="node-name">{name}</div>
        <div className="node-type">Salida</div>
      </div>
    );
  }

  const inputCount = kind === 'NOT' ? 1 : 2;

  return (
    <div className="logic-node gate-node">
      {inputCount === 1 ? (
        <InputHandle id="in-0" top="50%" />
      ) : (
        <>
          <InputHandle id="in-0" top="32%" />
          <InputHandle id="in-1" top="68%" />
        </>
      )}

      <div className="gate-symbol">
        {gateSymbols[kind]}
      </div>

      <div className="gate-instance">
        {name}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="out"
      />
    </div>
  );
}