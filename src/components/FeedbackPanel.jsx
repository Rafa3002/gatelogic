export default function FeedbackPanel({
  validation,
  simulation,
  nodes,
}) {
  const hasValidation =
    validation !== null;

  const hasSimulation =
    simulation.status !==
    'SIN_GENERAR';

  if (
    !hasValidation &&
    !hasSimulation
  ) {
    return null;
  }

  const getNodeName = (
    nodeId
  ) => {
    const node =
      nodes.find(
        (item) =>
          item.id === nodeId
      );

    return (
      node?.data?.name ??
      nodeId
    );
  };

  return (
    <section className="feedback-panel">
      {hasValidation && (
        <div className="feedback-card">
          <div className="feedback-title">
            <h3>
              Validación
            </h3>

            <span
              className={
                validation.isValid
                  ? 'status-valid'
                  : 'status-error'
              }
            >
              {validation.isValid
                ? 'CIRCUITO VÁLIDO'
                : 'CIRCUITO INVÁLIDO'}
            </span>
          </div>

          {validation.errors.length >
            0 && (
            <div className="message-list error-list">
              {validation.errors.map(
                (
                  error,
                  index
                ) => (
                  <div
                    key={
                      `${error.code}-${index}`
                    }
                    className="feedback-message"
                  >
                    <strong>
                      {error.code}
                    </strong>

                    <span>
                      {
                        error.message
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          )}

          {validation.warnings.length >
            0 && (
            <div className="message-list warning-list">
              {validation.warnings.map(
                (
                  warning,
                  index
                ) => (
                  <div
                    key={
                      `${warning.code}-${index}`
                    }
                    className="feedback-message"
                  >
                    <strong>
                      {
                        warning.code
                      }
                    </strong>

                    <span>
                      {
                        warning.message
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {hasSimulation && (
        <div className="feedback-card">
          <div className="feedback-title">
            <h3>
              Simulación
            </h3>

            <span
              className={
                simulation.status ===
                'VIGENTE'
                  ? 'status-valid'
                  : simulation.status ===
                      'DESACTUALIZADO'
                    ? 'status-warning'
                    : 'status-error'
              }
            >
              {
                simulation.status
              }
            </span>
          </div>

          {simulation.error && (
            <p className="simulation-error">
              {
                simulation.error
              }
            </p>
          )}

          {simulation.result &&
            Object.entries(
              simulation.result
                .outputValues
            ).map(
              ([
                outputId,
                value,
              ]) => (
                <div
                  className="simulation-output"
                  key={
                    outputId
                  }
                >
                  <strong>
                    {
                      getNodeName(
                        outputId
                      )
                    }
                  </strong>

                  <span>
                    =
                  </span>

                  <strong>
                    {value}
                  </strong>
                </div>
              )
            )}
        </div>
      )}
    </section>
  );
}