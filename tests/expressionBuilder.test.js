import test from 'node:test';
import assert from 'node:assert/strict';
import {parseBooleanExpression} from '../src/utils/expressionParser.js';
import {expressionToCircuit} from '../src/utils/expressionToCircuit.js';

test('Operator precedence: AND before OR',()=>{
 const {ast,inputs}=parseBooleanExpression('A | B & C');
 assert.equal(ast.kind,'OR'); assert.equal(ast.right.kind,'AND');assert.deepEqual(inputs,['A','B','C']);
});
test('Parentheses override precedence',()=>{
 const {ast}=parseBooleanExpression('(A | B) & C');
 assert.equal(ast.kind,'AND');assert.equal(ast.left.kind,'OR');
});
test('NOT and XOR',()=>{
 const {ast}=parseBooleanExpression('!A ^ B');
 assert.equal(ast.kind,'XOR');assert.equal(ast.left.kind,'NOT');
});
test('Repeated variable becomes one input',()=>{
 const result=expressionToCircuit('A & (A | B)');
 assert.equal(result.nodes.filter(n=>n.data.kind==='INPUT').length,2);
 assert.equal(result.nodes.filter(n=>n.data.kind==='OUTPUT').length,1);
 assert.equal(result.edges.length,5);
});
test('Generated gates have correct target handles',()=>{
 const {nodes,edges}=expressionToCircuit('(A & B) | !C');
 assert.equal(nodes.filter(n=>n.data.kind==='INPUT').length,3);
 assert.equal(nodes.filter(n=>n.data.kind==='NOT').length,1);
 assert.equal(nodes.filter(n=>n.data.kind==='AND').length,1);
 assert.equal(nodes.filter(n=>n.data.kind==='OR').length,1);
 const counts=new Map();for(const e of edges){const key=e.target+':'+e.targetHandle;assert.equal(counts.has(key),false);counts.set(key,1);}
});
test('Reject invalid syntax',()=>{
 for(const s of ['A &','(A | B','A B','A @ B','']) assert.throws(()=>parseBooleanExpression(s));
});
