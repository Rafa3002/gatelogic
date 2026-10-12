export default function AnalysisPanel({
  analysis,
}) {
  if (
    analysis.status ===
      'SIN_GENERAR' &&
    !analysis.truthTable &&
    !analysis.expressionResult
  ) {
    return null;
  }

  const truthTable =
    analysis.truthTable;

  const expressionResult =
    analysis.expressionResult;

  return (
    <section className="analysis-panel">
      <div className="analysis-status-row">
        <strong>
          Análisis integrado
        </strong>

        <span
          className={
            `analysis-status status-${analysis.status.toLowerCase()}`
          }
        >
          {analysis.status}
        </span>
      </div>

      {analysis.status ===
        'DESACTUALIZADO' && (
        <div className="stale-warning">
          El circuito fue modificado.
          Los resultados visibles
          pertenecen a la revisión{' '}
          {analysis.revision} y ya
          no deben considerarse
          vigentes.
        </div>
      )}

      {analysis.error && (
        <div className="analysis-error">
          <strong>
            No fue posible completar
            el análisis.
          </strong>

          <span>
            {analysis.error}
          </span>
        </div>
      )}

      {analysis.equivalence && (
        <div
          className={
            analysis.equivalence
              .isEquivalent
              ? 'equivalence-ok'
              : 'equivalence-error'
          }
        >
          {analysis.equivalence
            .isEquivalent
            ? '✓ Circuito, tabla de verdad y expresión booleana son funcionalmente equivalentes.'
            : '✕ Se detectó una inconsistencia entre las representaciones.'}
        </div>
      )}

      <div className="result-grid">
        {truthTable && (
          <div className="result-card">
            <div className="result-header">
              <h3>
                Tabla de verdad
              </h3>

              <span>
                Revisión{' '}
                {
                  truthTable.revision
                }
              </span>
            </div>

            <div className="table-wrapper">
              <table className="truth-table">
                <thead>
                  <tr>
                    {truthTable.inputs.map(
                      (input) => (
                        <th
                          key={
                            input.id
                          }
                        >
                          {
                            input.name
                          }
                        </th>
                      )
                    )}

                    {truthTable.outputs.map(
                      (output) => (
                        <th
                          key={
                            output.id
                          }
                          className="output-column"
                        >
                          {
                            output.name
                          }
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {truthTable.rows.map(
                    (
                      row,
                      rowIndex
                    ) => (
                      <tr
                        key={
                          rowIndex
                        }
                      >
                        {row.inputValues.map(
                          (
                            value,
                            index
                          ) => (
                            <td
                              key={
                                `i-${index}`
                              }
                            >
                              {
                                value
                              }
                            </td>
                          )
                        )}

                        {row.outputValues.map(
                          (
                            value,
                            index
                          ) => (
                            <td
                              key={
                                `o-${index}`
                              }
                              className="output-column"
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
            </div>
          </div>
        )}

        {expressionResult && (
          <div className="result-card">
            <div className="result-header">
              <h3>
                Expresión booleana
              </h3>

              <span>
                Revisión{' '}
                {
                  expressionResult
                    .revision
                }
              </span>
            </div>

            <div className="expressions">
              {expressionResult
                .expressions
                .map(
                  (item) => (
                    <div
                      className="expression-line"
                      key={
                        item.outputId
                      }
                    >
                      <strong>
                        {
                          item.outputName
                        }
                      </strong>

                      <span>=</span>

                      <code>
                        {
                          item.expression
                        }
                      </code>
                    </div>
                  )
                )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}