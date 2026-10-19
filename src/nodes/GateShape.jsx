function StrokeLine({ x1, y1, x2, y2 }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  );
}

function GatePath({ kind }) {
  const common = {
    fill: 'white',
    stroke: 'currentColor',
    strokeWidth: 3,
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
  };

  const twoInputs = (
    <>
      <StrokeLine x1="0" y1="21" x2="18" y2="21" />
      <StrokeLine x1="0" y1="49" x2="18" y2="49" />
    </>
  );

  switch (kind) {
    case 'AND':
      return (
        <>
          {twoInputs}
          <path {...common} d="M18 10 H54 C86 10 86 60 54 60 H18 Z" />
          <StrokeLine x1="86" y1="35" x2="116" y2="35" />
        </>
      );

    case 'NAND':
      return (
        <>
          {twoInputs}
          <path {...common} d="M18 10 H50 C80 10 80 60 50 60 H18 Z" />
          <circle {...common} cx="86" cy="35" r="6" />
          <StrokeLine x1="92" y1="35" x2="116" y2="35" />
        </>
      );

    case 'OR':
      return (
        <>
          {twoInputs}
          <path {...common} d="M18 10 Q52 10 90 35 Q52 60 18 60 Q34 35 18 10 Z" />
          <StrokeLine x1="90" y1="35" x2="116" y2="35" />
        </>
      );

    case 'NOR':
      return (
        <>
          {twoInputs}
          <path {...common} d="M18 10 Q50 10 84 35 Q50 60 18 60 Q34 35 18 10 Z" />
          <circle {...common} cx="91" cy="35" r="6" />
          <StrokeLine x1="97" y1="35" x2="116" y2="35" />
        </>
      );

    case 'XOR':
      return (
        <>
          <StrokeLine x1="0" y1="21" x2="24" y2="21" />
          <StrokeLine x1="0" y1="49" x2="24" y2="49" />
          <path {...common} d="M24 10 Q56 10 94 35 Q56 60 24 60 Q40 35 24 10 Z" />
          <path {...common} fill="none" d="M14 10 Q30 35 14 60" />
          <StrokeLine x1="94" y1="35" x2="116" y2="35" />
        </>
      );

    case 'XNOR':
      return (
        <>
          <StrokeLine x1="0" y1="21" x2="24" y2="21" />
          <StrokeLine x1="0" y1="49" x2="24" y2="49" />
          <path {...common} d="M24 10 Q52 10 86 35 Q52 60 24 60 Q40 35 24 10 Z" />
          <path {...common} fill="none" d="M14 10 Q30 35 14 60" />
          <circle {...common} cx="93" cy="35" r="6" />
          <StrokeLine x1="99" y1="35" x2="116" y2="35" />
        </>
      );

    case 'NOT':
      return (
        <>
          <StrokeLine x1="0" y1="35" x2="20" y2="35" />
          <path {...common} d="M20 10 L82 35 L20 60 Z" />
          <circle {...common} cx="91" cy="35" r="6" />
          <StrokeLine x1="97" y1="35" x2="116" y2="35" />
        </>
      );

    default:
      return <rect {...common} x="18" y="10" width="70" height="50" rx="6" />;
  }
}

export default function GateShape({ kind }) {
  return (
    <svg
      className="gate-body-svg"
      viewBox="0 0 120 70"
      role="img"
      aria-label={`Compuerta ${kind}`}
    >
      <GatePath kind={kind} />
      <text
        x="54"
        y="39"
        textAnchor="middle"
        className="gate-body-label"
      >
        {kind}
      </text>
    </svg>
  );
}
