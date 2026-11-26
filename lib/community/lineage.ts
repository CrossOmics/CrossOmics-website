export type LineageVersion = { id: string; parent: string | null };
export type LineageNode = { id: string; x: number; y: number; issue: "missing-parent" | "cycle" | "ambiguous-parent" | null };
export type LineageLayout = { nodes: LineageNode[]; edges: { parent: string; child: string }[]; width: number; height: number };
export type LineageView = { scale: number; x: number; y: number };
export const lineageIssueLabels = { "missing-parent": "Parent not available", cycle: "Invalid parent relationship", "ambiguous-parent": "Multiple recorded origins" };
export const lineageNodeSize = { width: 244, height: 152 };

/** Build a forest from identity links, never API/recommendation ordering. Iterative for deep chains. */
export function buildLineage(versions: readonly LineageVersion[]): LineageLayout {
  const ids = new Set(versions.map(version => version.id));
  const parents = new Map<string, string | null>();
  const issues = new Map<string, LineageNode["issue"]>();
  for (const version of versions) {
    parents.set(version.id, version.parent && ids.has(version.parent) ? version.parent : null);
    issues.set(version.id, version.parent && !ids.has(version.parent) ? "missing-parent" : null);
  }
  const done = new Set<string>();
  for (const id of ids) {
    const path: string[] = [], positions = new Map<string, number>();
    let current: string | null = id;
    while (current !== null && !done.has(current)) {
      if (positions.has(current)) {
        for (const cyclic of path.slice(positions.get(current)!)) {
          parents.set(cyclic, null);
          issues.set(cyclic, "cycle");
        }
        break;
      }
      positions.set(current, path.length);
      path.push(current);
      current = parents.get(current) ?? null;
    }
    for (const visited of path) done.add(visited);
  }
  const children = new Map<string, string[]>();
  const roots: string[] = [], edges: LineageLayout["edges"] = [];
  for (const id of ids) children.set(id, []);
  for (const id of ids) {
    const parent = parents.get(id);
    if (parent) { children.get(parent)!.push(id); edges.push({ parent, child: id }); }
    else roots.push(id);
  }
  const nodes = new Map<string, LineageNode>();
  let leaf = 0, maxDepth = 0;
  const stack = [...roots].reverse().map(id => ({ id, depth: 0, exit: false }));
  while (stack.length) {
    const { id, depth, exit } = stack.pop()!;
    const descendants = children.get(id)!;
    if (!exit && descendants.length) {
      stack.push({ id, depth, exit: true });
      for (const child of [...descendants].reverse()) stack.push({ id: child, depth: depth + 1, exit: false });
    } else {
      const y = descendants.length
        ? (nodes.get(descendants[0])!.y + nodes.get(descendants[descendants.length - 1])!.y) / 2
        : 24 + leaf++ * 184;
      nodes.set(id, { id, x: 24 + depth * 344, y, issue: issues.get(id) ?? null });
      maxDepth = Math.max(maxDepth, depth);
    }
  }
  return { nodes: [...ids].map(id => nodes.get(id)!), edges,
    width: 48 + maxDepth * 344 + lineageNodeSize.width,
    height: 48 + Math.max(0, leaf - 1) * 184 + lineageNodeSize.height };
}

export function fitLineage(bounds: { width: number; height: number }, viewport: { width: number; height: number }): LineageView {
  const scale = Math.max(.1, Math.min(1, Math.max(0, viewport.width - 32) / Math.max(1, bounds.width),
    Math.max(0, viewport.height - 32) / Math.max(1, bounds.height)));
  return { scale, x: Math.max(0, (viewport.width - bounds.width * scale) / 2), y: Math.max(0, (viewport.height - bounds.height * scale) / 2) };
}

export function zoomLineage(view: LineageView, scale: number, anchor: { x: number; y: number }): LineageView {
  const next = Math.max(.1, Math.min(2, scale));
  return { scale: next, x: anchor.x - (anchor.x - view.x) * next / view.scale,
    y: anchor.y - (anchor.y - view.y) * next / view.scale };
}

export type LineageGesture = { view: LineageView; point: { x: number; y: number }; distance: number; pan: boolean };
export function moveLineageGesture(start: LineageGesture, points: { x: number; y: number }[]): LineageView | null {
  const [a,b] = points;
  if (!a) return null;
  if (b && start.distance > 0) {
    const next = zoomLineage(start.view, start.view.scale * Math.hypot(a.x-b.x,a.y-b.y) / start.distance, start.point);
    return { ...next, x:next.x+(a.x+b.x)/2-start.point.x, y:next.y+(a.y+b.y)/2-start.point.y };
  }
  const moved = Math.hypot(a.x-start.point.x, a.y-start.point.y) > 4;
  return start.pan || moved ? { ...start.view, x:start.view.x+a.x-start.point.x, y:start.view.y+a.y-start.point.y } : null;
}
