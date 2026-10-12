export function buildCircuitModel(
  nodes,
  edges,
  revision
) {
  const components = nodes.map((node) => ({
    id: node.id,
    kind: node.data.kind,
    name: node.data.name,
  }));

  const connections = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    sourcePort: edge.sourceHandle,
    target: edge.target,
    targetPort: edge.targetHandle,
  }));

  const visual = nodes.map((node) => ({
    id: node.id,
    position: {
      x: node.position.x,
      y: node.position.y,
    },
  }));

  return {
    revision,
    logical: {
      components,
      connections,
    },
    visual,
  };
}