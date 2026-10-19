import { useState } from 'react';
import { parseBooleanExpression } from '../utils/expressionParser.js';
export default function ExpressionBuilderPanel({onGenerate}) {
  const [expression,setExpression]=useState('(A & B) | !C');
  const [error,setError]=useState('');
  const [preview,setPreview]=useState(null);
  const validate=()=>{
    try {const result=parseBooleanExpression(expression);setError('');setPreview(result);return true;}
    catch(e){setError(e.message);setPreview(null);return false;}
  };
  const generate=()=>{if(validate())onGenerate(expression);};
  return (
    <section className="expression-builder" aria-label="Generar circuito desde expresión">
      <h3>Expresión booleana → circuito</h3>
      <p>Operadores: <code>!</code> NOT, <code>&</code> AND, <code>^</code> XOR, <code>|</code> OR. Usa paréntesis para agrupar.</p>
      <label htmlFor="gate-expression">Expresión</label>
      <textarea id="gate-expression" value={expression} onChange={e=>{setExpression(e.target.value);setPreview(null);setError('');}} rows={2} maxLength={250} spellCheck={false}/>
      <div className="expression-builder-actions">
        <button type="button" onClick={validate}>Comprobar sintaxis</button>
        <button type="button" onClick={generate}>Generar circuito</button>
      </div>
      {preview && <p role="status">Sintaxis válida. Entradas: {preview.inputs.join(', ')}.</p>}
      {error && <p role="alert" className="expression-builder-error">{error}</p>}
      <p className="expression-builder-hint">Al generar, se reemplaza el circuito actual previa confirmación. Haz un respaldo antes si lo necesitas.</p>
    </section>
  );
}
