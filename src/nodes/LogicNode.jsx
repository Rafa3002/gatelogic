import {
  Handle,
  Position,
} from '@xyflow/react';

import GateShape from './GateShape';

function InputHandle({
  id,
  top,
}) {
  return (
    <Handle
      type="target"
      position={Position.Left}
      id={id}
      style={{ top }}
    />
  );
}

function ValueBadge({
  value,
}) {
  if (
    value !== 0 &&
    value !== 1
  ) {
    return (
      <span className="value-badge unknown-value">
        ?
      </span>
    );
  }

  return (
    <span
      className={
        `value-badge ${
          value === 1
            ? 'high-value'
            : 'low-value'
        }`
      }
    >
      {value}
    </span>
  );
}

export default function LogicNode({
  id,
  data,
}) {
  const {
    kind,
    name,
    logicValue,
    inputValue,
    onToggleInput,
    hasError,
  } = data;

  const signalClass =
    logicValue === 1
      ? 'node-signal-high'
      : logicValue === 0
        ? 'node-signal-low'
        : '';

  const errorClass =
    hasError
      ? 'node-validation-error'
      : '';

  if (kind === 'INPUT') {
    return (
      <div
        className={
          `logic-node input-node ${
            inputValue === 1
              ? 'node-signal-high'
              : 'node-signal-low'
          } ${errorClass}`
        }
      >
        <div className="node-name">
          {name}
        </div>

        <div className="node-type">
          Entrada
        </div>

        <button
          className="input-toggle nodrag nopan"
          onClick={(event) => {
            event.stopPropagation();
            onToggleInput?.(id);
          }}
          type="button"
        >
          {inputValue}
        </button>

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
      <div
        className={
          `logic-node output-node ${signalClass} ${errorClass}`
        }
      >
        <Handle
          type="target"
          position={Position.Left}
          id="in-0"
        />

        <div className="node-name">
          {name}
        </div>

        <div className="node-type">
          Salida
        </div>

        <ValueBadge
          value={logicValue}
        />
      </div>
    );
  }

  const inputCount =
    kind === 'NOT'
      ? 1
      : 2;

  return (
    <div
      className={
        `logic-node gate-node ${signalClass} ${errorClass}`
      }
    >
      {inputCount === 1 ? (
        <InputHandle
          id="in-0"
          top="43%"
        />
      ) : (
        <>
          <InputHandle
            id="in-0"
            top="26%"
          />

          <InputHandle
            id="in-1"
            top="60%"
          />
        </>
      )}

      <div className="gate-visual">
        <GateShape kind={kind} />

        <div className="gate-instance">
          {name}
        </div>

        <ValueBadge
          value={logicValue}
        />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '43%' }}
      />
    </div>
  );
}
