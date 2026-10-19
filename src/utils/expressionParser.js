/** RF-19: boolean expression parser. Operators: NOT (! ~ ¬), AND (& ∧ *), XOR (^ ⊕), OR (| ∨ +). */
const OPERATORS = { NOT: 'NOT', AND: 'AND', OR: 'OR', XOR: 'XOR' };
const TOKEN_RE = /\s+|[A-Za-z][A-Za-z0-9_]*|[()!~¬&∧*^⊕|∨+]/gy;
const SYMBOLS = { '!':'NOT', '~':'NOT', '¬':'NOT', '&':'AND', '∧':'AND', '*':'AND', '^':'XOR', '⊕':'XOR', '|':'OR', '∨':'OR', '+':'OR' };

export function parseBooleanExpression(source) {
  if (typeof source !== 'string' || !source.trim()) throw new Error('Escribe una expresión booleana. Ejemplo: (A & B) | !C.');
  if (source.length > 250) throw new Error('La expresión supera el límite de 250 caracteres.');
  const tokens=[]; let index=0;
  while (index < source.length) {
    TOKEN_RE.lastIndex=index;
    const match=TOKEN_RE.exec(source);
    if (!match) throw new Error(`Símbolo no reconocido en la posición ${index+1}: ${source[index]}`);
    index=TOKEN_RE.lastIndex;
    const token=match[0];
    if (/^\s+$/.test(token)) continue;
    const upper=token.toUpperCase();
    if (OPERATORS[upper]) tokens.push({kind:'op',value:upper});
    else if (SYMBOLS[token]) tokens.push({kind:'op',value:SYMBOLS[token]});
    else if (token==='(' || token===')') tokens.push({kind:token,value:token});
    else tokens.push({kind:'name',value:upper});
  }
  let at=0;
  const peek=()=>tokens[at];
  const consume=()=>tokens[at++];
  function primary() {
    const next=peek();
    if (!next) throw new Error('Falta un operando al final de la expresión.');
    if (next.kind==='op' && next.value==='NOT') {consume();return {kind:'NOT',child:primary()};}
    if (next.kind==='(') {consume();const expression=orExpression();if (peek()?.kind!==')') throw new Error('Falta cerrar un paréntesis.');consume();return expression;}
    if (next.kind==='name') {consume();return {kind:'INPUT',name:next.value};}
    throw new Error(`Se esperaba una entrada o subexpresión, pero se encontró «${next.value}».`);
  }
  function binary(parseNext, operator) {
    let left=parseNext();
    while (peek()?.kind==='op' && peek().value===operator) {consume();left={kind:operator,left,right:parseNext()};}
    return left;
  }
  function andExpression() {return binary(primary,'AND');}
  function xorExpression() {return binary(andExpression,'XOR');}
  function orExpression() {return binary(xorExpression,'OR');}
  const ast=orExpression();
  if (at < tokens.length) throw new Error(`Operación incompleta o símbolo inesperado: «${peek().value}».`);
  const names=new Set();
  function traverse(node){ if(node.kind==='INPUT') names.add(node.name); else if(node.kind==='NOT') traverse(node.child); else {traverse(node.left);traverse(node.right);} }
  traverse(ast);
  if (names.size>10) throw new Error('Se admiten como máximo 10 entradas en esta versión.');
  if (tokens.length>90) throw new Error('La expresión es demasiado compleja (máximo 90 elementos).');
  return {ast,inputs:[...names].sort()};
}
