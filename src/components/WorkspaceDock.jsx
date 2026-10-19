
import { useCallback, useRef, useState } from 'react';

const MIN_HEIGHT = 180;
const DEFAULT_HEIGHT = 320;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getInitialHeight() {
  if (typeof window === 'undefined') {
    return DEFAULT_HEIGHT;
  }

  if (window.innerWidth <= 767) {
    return Math.min(
      260,
      window.innerHeight * 0.4
    );
  }

  if (window.innerWidth <= 1024) {
    return 280;
  }

  return DEFAULT_HEIGHT;
}

export default function WorkspaceDock({
  open,
  onOpenChange,
  activeTab,
  onTabChange,
  resultsContent,
  learningContent,
  modelContent,
}) {
  const [height, setHeight] = useState(getInitialHeight);

  const dragState = useRef(null);

  const beginResize = useCallback(
    (event) => {
      event.preventDefault();

      dragState.current = {
        startY: event.clientY,
        startHeight: height,
      };

      const handleMove = (moveEvent) => {
        if (!dragState.current) {
          return;
        }

        const delta =
          dragState.current.startY - moveEvent.clientY;

        const maxHeight = Math.max(
          MIN_HEIGHT,
          window.innerHeight * 0.55
        );

        setHeight(
          clamp(
            dragState.current.startHeight + delta,
            MIN_HEIGHT,
            maxHeight
          )
        );
      };

      const handleUp = () => {
        dragState.current = null;

        window.removeEventListener(
          'pointermove',
          handleMove
        );

        window.removeEventListener(
          'pointerup',
          handleUp
        );
      };

      window.addEventListener(
        'pointermove',
        handleMove
      );

      window.addEventListener(
        'pointerup',
        handleUp
      );
    },
    [height]
  );

  const tabs = [
    ['results', 'Resultados'],
    ['learning', 'Aprendizaje'],
    ['model', 'Modelo'],
  ];

  const renderContent = () => {
    if (activeTab === 'learning') {
      return learningContent;
    }

    if (activeTab === 'model') {
      return modelContent;
    }

    return resultsContent;
  };

  if (!open) {
    return (
      <div className="workspace-dock workspace-dock-collapsed">
        <button
          type="button"
          className="dock-open-button"
          onClick={() => onOpenChange(true)}
        >
          Mostrar panel inferior
        </button>
      </div>
    );
  }

  return (
    <section
      className="workspace-dock"
      style={{ height }}
    >
      <div
        className="dock-resize-handle"
        onPointerDown={beginResize}
        title="Arrastra para cambiar la altura"
      >
        <span />
      </div>

      <header className="dock-toolbar">
        <div
          className="dock-tabs"
          role="tablist"
          aria-label="Panel de trabajo"
        >
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              className={
                activeTab === id
                  ? 'dock-tab active'
                  : 'dock-tab'
              }
              onClick={() => onTabChange(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="dock-actions">
          <span className="dock-size-label">
            {Math.round(height)} px
          </span>

          <button
            type="button"
            className="dock-collapse-button"
            onClick={() => onOpenChange(false)}
          >
            Minimizar
          </button>
        </div>
      </header>

      <div className="workspace-dock-content">
        {renderContent()}
      </div>
    </section>
  );
}
