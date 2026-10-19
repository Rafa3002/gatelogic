import { parseBooleanExpression } from './expressionParser.js';
/** RF-20: Creates normal React Flow nodes/edges, compatible with the existing logic engine. No state is mutated. */
export function expressionToCircuit(expression) {
  const {ast,inputs}=parseBooleanExpression(expression);
  const nodes=[]; const edges=[];
  const newId=()=>crypto.randomUUID();
  const inputNodes=new Map();
  const countByKind={};
  for (const [i,name] of inputs.entries()) {
    const id=newId(); inputNodes.set(name,id);
    nodes.push({id,type:'logicNode',position:{x:70,y:80+i*115},data:{kind:'INPUT',name}});
  }
  function visit(node) {
    if(node.kind==='INPUT') return {id:inputNodes.get(node.name),depth:0,y:80+inputs.indexOf(node.name)*115};
    const args=node.kind==='NOT'?[visit(node.child)]:[visit(node.left),visit(node.right)];
    const depth=Math.max(...args.map(a=>a.depth))+1;
    const y=args.reduce((sum,a)=>sum+a.y,0)/args.length;
    const id=newId();
    countByKind[node.kind]=(countByKind[node.kind]||0)+1;
    nodes.push({id,type:'logicNode',position:{x:70+depth*200,y},data:{kind:node.kind,name:`${node.kind}${countByKind[node.kind]}`}});
    args.forEach((input,index)=>edges.push({id:newId(),source:input.id,sourceHandle:'out',target:id,targetHandle:`in-${index}`}));
    return {id,depth,y};
  }
  const root=visit(ast);
  const outputId=newId();
  nodes.push({id:outputId,type:'logicNode',position:{x:70+(root.depth+1)*200,y:root.y},data:{kind:'OUTPUT',name:'F1'}});
  edges.push({id:newId(),source:root.id,sourceHandle:'out',target:outputId,targetHandle:'in-0'});
  return {nodes,edges,inputValues:Object.fromEntries([...inputNodes.values()].map(id=>[id,0])),ast,inputs};
}
