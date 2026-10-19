import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

function currentReport(analysis, currentRevision) {
  if (
    analysis?.status !== 'VIGENTE' ||
    analysis?.revision !== currentRevision ||
    !analysis.truthTable ||
    !analysis.expressionResult ||
    analysis.equivalence?.isEquivalent !== true
  ) {
    throw new Error('Primero genera un análisis vigente y equivalente del circuito actual.');
  }
  return analysis;
}

function circuitElement() {
  const el = document.querySelector('.flow-container .react-flow');
  if (!el) throw new Error('No se encontró el editor para capturarlo.');
  return el;
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function captureCircuit() {
  const el = circuitElement();
  // Captura el encuadre que el usuario ve, no el circuito entero fuera de pantalla.
  return await toPng(el, {
    cacheBust: true,
    backgroundColor: '#ffffff',
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    filter: (node) => {
      return !(
        node instanceof Element &&
        (node.classList.contains('react-flow__controls') ||
          node.classList.contains('react-flow__minimap') ||
          node.classList.contains('react-flow__attribution'))
      );
    },
  });
}

export async function downloadCircuitPNG(analysis, revision) {
  currentReport(analysis, revision);
  const image = await captureCircuit();
  downloadDataUrl(image, `GateLogic-circuito-r${revision}.png`);
}

function safeText(value) {
  // jsPDF Helvetica no incluye todos los símbolos booleanos Unicode.
  return String(value)
    .replaceAll('¬', 'NOT ')
    .replaceAll('∧', ' AND ')
    .replaceAll('∨', ' OR ')
    .replaceAll('⊕', ' XOR ');
}

export async function downloadCircuitPDF(analysis, revision) {
  const report = currentReport(analysis, revision);
  const image = await captureCircuit();
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const usable = pageW - margin * 2;
  let y = margin;

  function newPageIfNeeded(height) {
    if (y + height > pageH - margin) {
      pdf.addPage();
      y = margin;
    }
  }
  function write(text, size = 10, lineHeight = 5) {
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(safeText(text), usable);
    for (const line of lines) {
      newPageIfNeeded(lineHeight);
      pdf.text(line, margin, y);
      y += lineHeight;
    }
  }

  pdf.setFont('helvetica', 'bold');
  write('GateLogic - Informe de circuito', 16, 8);
  pdf.setFont('helvetica', 'normal');
  write(`Revision logica: ${revision} | Fecha: ${new Date().toLocaleString('es-GT')}`, 9, 6);
  y += 3;

  const props = pdf.getImageProperties(image);
  const imageW = usable;
  const imageH = imageW * props.height / props.width;
  const usablePageHeight = pageH - 2 * margin;
  // Evitar cortar una imagen demasiado alta.
  const ratio = Math.min(1, usablePageHeight / imageH);
  newPageIfNeeded(imageH * ratio + 6);
  pdf.addImage(image, 'PNG', margin, y, imageW * ratio, imageH * ratio);
  y += imageH * ratio + 8;

  newPageIfNeeded(12);
  pdf.setFont('helvetica', 'bold');
  write('Expresiones booleanas', 12, 7);
  pdf.setFont('helvetica', 'normal');
  for (const item of report.expressionResult.expressions) {
    write(`${item.outputName}: ${item.expression}`, 10, 6);
  }

  y += 4;
  newPageIfNeeded(12);
  pdf.setFont('helvetica', 'bold');
  write('Tabla de verdad', 12, 7);
  pdf.setFont('courier', 'normal');
  const table = report.truthTable;
  const header = [...table.inputs.map(x => x.name), ...table.outputs.map(x => x.name)].join('  |  ');
  write(header, 9, 5);
  write('-'.repeat(Math.min(90, header.length + 4)), 9, 5);
  for (const row of table.rows) {
    const line = [...row.inputValues, ...row.outputValues].join('    |    ');
    write(line, 9, 5);
  }
  y += 4;
  pdf.setFont('helvetica', 'normal');
  write('Equivalencia verificada: SI', 10, 6);
  pdf.save(`GateLogic-reporte-r${revision}.pdf`);
}
