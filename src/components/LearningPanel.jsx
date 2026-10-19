import {
  useState,
} from 'react';

import {
  learningActivities,
  gateReference,
} from '../utils/learningActivities';

export default function LearningPanel({
  selectedActivityId,
  onSelectActivity,
  onCheckActivity,
  activityResult,
}) {
  const [
    section,
    setSection,
  ] = useState('activities');

  const selectedActivity =
    learningActivities.find(
      (activity) =>
        activity.id ===
        selectedActivityId
    );

  return (
    <section className="learning-panel">
      <div className="learning-header">
        <div>
          <h2>
            Centro de aprendizaje
          </h2>

          <p>
            Practica y comprueba tus
            conocimientos de lógica digital.
          </p>
        </div>

        <div className="learning-tabs">
          <button
            className={
              section === 'activities'
                ? 'learning-tab active'
                : 'learning-tab'
            }
            onClick={() =>
              setSection(
                'activities'
              )
            }
          >
            Actividades
          </button>

          <button
            className={
              section === 'reference'
                ? 'learning-tab active'
                : 'learning-tab'
            }
            onClick={() =>
              setSection(
                'reference'
              )
            }
          >
            Compuertas
          </button>
        </div>
      </div>

      {section ===
        'activities' && (
        <div className="learning-content">
          <div className="activity-list">
            {learningActivities.map(
              (activity) => (
                <button
                  key={
                    activity.id
                  }
                  className={
                    selectedActivityId ===
                    activity.id
                      ? 'activity-item selected'
                      : 'activity-item'
                  }
                  onClick={() =>
                    onSelectActivity(
                      activity.id
                    )
                  }
                >
                  <span className="activity-code">
                    {
                      activity.id
                    }
                  </span>

                  <strong>
                    {
                      activity.title
                    }
                  </strong>

                  <small>
                    {
                      activity.level
                    }
                  </small>
                </button>
              )
            )}
          </div>

          <div className="activity-detail">
            {!selectedActivity ? (
              <div className="learning-empty">
                Selecciona una actividad
                para comenzar.
              </div>
            ) : (
              <>
                <div className="activity-title-row">
                  <div>
                    <span className="activity-code">
                      {
                        selectedActivity.id
                      }
                    </span>

                    <h3>
                      {
                        selectedActivity.title
                      }
                    </h3>
                  </div>

                  <span className="level-badge">
                    {
                      selectedActivity.level
                    }
                  </span>
                </div>

                <div className="learning-block">
                  <strong>
                    Objetivo
                  </strong>

                  <p>
                    {
                      selectedActivity.objective
                    }
                  </p>
                </div>

                <div className="learning-block">
                  <strong>
                    Instrucciones
                  </strong>

                  <p>
                    {
                      selectedActivity.instructions
                    }
                  </p>
                </div>

                <details className="hint-box">
                  <summary>
                    Ver pista
                  </summary>

                  <p>
                    {
                      selectedActivity.hint
                    }
                  </p>
                </details>

                <div className="expected-expression">
                  <span>
                    Función objetivo
                  </span>

                  <code>
                    {
                      selectedActivity.expectedExpression
                    }
                  </code>
                </div>

                <button
                  className="check-activity-button"
                  onClick={
                    onCheckActivity
                  }
                >
                  Comprobar mi circuito
                </button>

                {activityResult && (
                  <div
                    className={
                      activityResult.success
                        ? 'activity-result success'
                        : 'activity-result failure'
                    }
                  >
                    <strong>
                      {activityResult.success
                        ? '✓ Actividad correcta'
                        : '✕ Todavía no está correcta'}
                    </strong>

                    <p>
                      {
                        activityResult.message
                      }
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {section ===
        'reference' && (
        <div className="gate-reference-grid">
          {gateReference.map(
            (gate) => (
              <article
                key={gate.kind}
                className="gate-learning-card"
              >
                <div className="gate-learning-title">
                  <strong>
                    {
                      gate.name
                    }
                  </strong>

                  <span>
                    {
                      gate.kind
                    }
                  </span>
                </div>

                <p>
                  {
                    gate.description
                  }
                </p>

                <code className="gate-expression">
                  {
                    gate.expression
                  }
                </code>

                <table className="mini-truth-table">
                  <thead>
                    <tr>
                      <th>A</th>

                      {gate.kind !==
                        'NOT' && (
                        <th>B</th>
                      )}

                      <th>F</th>
                    </tr>
                  </thead>

                  <tbody>
                    {gate.table.map(
                      (
                        row,
                        index
                      ) => (
                        <tr
                          key={
                            index
                          }
                        >
                          {row.map(
                            (
                              value,
                              cellIndex
                            ) => (
                              <td
                                key={
                                  cellIndex
                                }
                              >
                                {
                                  value
                                }
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}