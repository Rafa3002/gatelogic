import { useState } from 'react';
import { downloadCircuitPNG, downloadCircuitPDF } from '../utils/exportReports.js';

export default function ExportActions({ analysis, revision }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const canExport = analysis?.status === 'VIGENTE' &&
    analysis?.revision === revision &&
    analysis?.equivalence?.isEquivalent === true;

  async function run(kind) {
    setError('');
    setBusy(kind);
    try {
      if (kind === 'png') await downloadCircuitPNG(analysis, revision);
      else await downloadCircuitPDF(analysis, revision);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al exportar.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="gatelogic-export-actions">
      <button type="button" disabled={!canExport || !!busy} onClick={() => run('png')}>
        {busy === 'png' ? 'Generando...' : 'Exportar PNG'}
      </button>
      <button type="button" disabled={!canExport || !!busy} onClick={() => run('pdf')}>
        {busy === 'pdf' ? 'Generando...' : 'Exportar PDF'}
      </button>
      {!canExport && <small>Analiza el circuito actual para habilitar las exportaciones.</small>}
      {error && <p role="alert" className="gatelogic-export-error">{error}</p>}
    </div>
  );
}
