const components = [
  { kind: 'INPUT', label: 'Entrada' },
  { kind: 'OUTPUT', label: 'Salida' },
  { kind: 'AND', label: 'AND' },
  { kind: 'OR', label: 'OR' },
  { kind: 'NOT', label: 'NOT' },
  { kind: 'NAND', label: 'NAND' },
  { kind: 'NOR', label: 'NOR' },
  { kind: 'XOR', label: 'XOR' },
  { kind: 'XNOR', label: 'XNOR' },
];

export default function Sidebar({
  onAddComponent,
  onClear,
  revision,
}) {
  return (
    <aside className="sidebar">
      <div>
        <h1>GateLogic</h1>
        <p className="subtitle">
          Editor de circuitos digitales
        </p>
      </div>

      <div className="sidebar-section">
        <h2>Entradas / Salidas</h2>

        {components.slice(0, 2).map((component) => (
          <button
            key={component.kind}
            onClick={() =>
              onAddComponent(component.kind)
            }
          >
            + {component.label}
          </button>
        ))}
      </div>

      <div className="sidebar-section">
        <h2>Compuertas</h2>

        {components.slice(2).map((component) => (
          <button
            key={component.kind}
            onClick={() =>
              onAddComponent(component.kind)
            }
          >
            + {component.label}
          </button>
        ))}
      </div>

      <div className="sidebar-section">
        <h2>Circuito</h2>

        <div className="revision-box">
          Revisión lógica:
          <strong>{revision}</strong>
        </div>

        <button
          className="danger-button"
          onClick={onClear}
        >
          Limpiar circuito
        </button>
      </div>

      <div className="help-box">
        <strong>Ayuda</strong>

        <p>
          Arrastra los componentes para moverlos.
        </p>

        <p>
          Une los círculos de salida con los círculos de entrada.
        </p>

        <p>
          Selecciona un componente o conexión y presiona
          <strong> Delete / Supr</strong> para eliminarlo.
        </p>
      </div>
    </aside>
  );
}