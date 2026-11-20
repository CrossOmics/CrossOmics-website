"use client";

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { buildLineage, fitLineage, lineageNodeSize, lineageIssueLabels, zoomLineage, moveLineageGesture, type LineageGesture, type LineageView, type LineageNode } from "@/lib/community/lineage";
import styles from "./VersionLineage.module.css";

type Version = { id: string; label: string; parent: string | null; type: string; repo: string; withdrawn: boolean; authors: string; issue?: LineageNode["issue"] };
type Point = { x: number; y: number };

export default function VersionLineage({ versions, recommendedIds = [], details, latestId, repositoryName }: {
  versions: Version[]; recommendedIds?: string[]; details: ReactNode[]; latestId?: string; repositoryName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(latestId ?? versions[0]?.id ?? "");
  const [view, setView] = useState<LineageView>({ scale: 1, x: 24, y: 24 });
  const viewport = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<LineageGesture | null>(null);
  const suppressClick = useRef(false);
  const graphId = useId(), markerId = useId();
  const layout = useMemo(() => {
    const graph = buildLineage(versions);
    const issues = new Map(versions.map(version => [version.id, version.issue]));
    return { ...graph, nodes: graph.nodes.map(node => ({ ...node, issue: node.issue ?? issues.get(node.id) ?? null })) };
  }, [versions]);
  const positions = useMemo(() => new Map(layout.nodes.map(node => [node.id, node])), [layout]);
  const validParents = useMemo(() => new Map(layout.edges.map(edge => [edge.child,edge.parent])), [layout]);
  const byId = useMemo(() => new Map(versions.map(version => [version.id, version])), [versions]);
  const currentIndex = Math.max(0, versions.findIndex(version => version.id === selected));
  const updateView = (next: LineageView) => { viewRef.current = next; setView(next); };
  const center = () => ({ x: (viewport.current?.clientWidth ?? 0) / 2, y: (viewport.current?.clientHeight ?? 0) / 2 });
  const fit = () => {
    if (viewport.current) updateView(fitLineage(layout, { width: viewport.current.clientWidth, height: viewport.current.clientHeight }));
  };
  useEffect(() => {
    if (!open || !viewport.current) return;
    const element = viewport.current;
    const observer = new ResizeObserver(() => updateView(fitLineage(layout, { width: element.clientWidth, height: element.clientHeight })));
    observer.observe(element);
    return () => { observer.disconnect(); pointers.current.clear(); gesture.current = null; };
  }, [open, layout]);

  const point = (event: PointerEvent) => {
    const rect = viewport.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const beginGesture = (pan: boolean) => {
    const [a, b] = [...pointers.current.values()];
    gesture.current = a ? { view: viewRef.current, point: b ? { x: (a.x+b.x)/2, y: (a.y+b.y)/2 } : a,
      distance: b ? Math.hypot(a.x-b.x,a.y-b.y) : 0, pan } : null;
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (!pointers.current.size) suppressClick.current = false;
    pointers.current.set(event.pointerId, point(event));
    const pan = !(event.target as HTMLElement).closest("button");
    if (pan || pointers.current.size > 1) {
      event.currentTarget.setPointerCapture(event.pointerId);
      if (pointers.current.size > 1) suppressClick.current = true;
    }
    beginGesture(pan);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, point(event));
    const points = [...pointers.current.values()], start = gesture.current;
    const next = moveLineageGesture(start, points);
    if (!next) return;
    if (points.length === 1) {
      start.pan = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (points.length > 1 || Math.hypot(points[0].x-start.point.x,points[0].y-start.point.y)>4) suppressClick.current = true;
    updateView(next);
  };
  const endPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(event.pointerId)) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    beginGesture(true);
  };
  const reveal = (id: string) => {
    const node = positions.get(id), element = viewport.current, v = viewRef.current;
    if (!node || !element) return;
    const left=node.x*v.scale+v.x, top=node.y*v.scale+v.y;
    if (left<0 || top<0 || left+lineageNodeSize.width*v.scale>element.clientWidth || top+lineageNodeSize.height*v.scale>element.clientHeight)
      updateView({ ...v, x:element.clientWidth/2-(node.x+lineageNodeSize.width/2)*v.scale,
        y:element.clientHeight/2-(node.y+lineageNodeSize.height/2)*v.scale });
  };

  return <section className={repositoryName ? "community-repository-versions" : "community-section"} aria-label={repositoryName ? `${repositoryName} versions` : "Tool versions"}>
    <div className={styles.heading}>
      {repositoryName ? <h4>{open ? `${repositoryName} lineage` : "Latest known update"}</h4> : <h2>Versions</h2>}
      {versions.length > 0 && <button className="community-primary" type="button" aria-expanded={open} aria-controls={graphId}
        onClick={() => setOpen(!open)}>{open ? (repositoryName ? "View latest update" : "View version list") : "View lineage"}</button>}
    </div>
    {open && <div id={graphId} className={styles.graph}>
      <div className={styles.caption}><span>Version lineage</span><span>Select a version to view details</span></div>
      <div className={styles.toolbar} role="group" aria-label="Lineage view controls">
        <button type="button" className="community-secondary" aria-label="Zoom out" disabled={view.scale <= .1}
          onClick={() => updateView(zoomLineage(viewRef.current,viewRef.current.scale/1.25,center()))}>−</button>
        <output aria-label="Zoom level">{Math.round(view.scale*100)}%</output>
        <button type="button" className="community-secondary" aria-label="Zoom in" disabled={view.scale >= 2}
          onClick={() => updateView(zoomLineage(viewRef.current,viewRef.current.scale*1.25,center()))}>+</button>
        <button type="button" className="community-secondary" onClick={fit}>Fit to view</button>
        <button type="button" className="community-secondary" onClick={() => updateView(zoomLineage(viewRef.current,1,center()))}>Reset</button>
      </div>
      <div className={styles.viewport} ref={viewport} tabIndex={0} role="group" aria-label="Version lineage canvas"
        aria-describedby={`${graphId}-help`} onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={endPointer} onPointerCancel={endPointer} onLostPointerCapture={endPointer}
        onClickCapture={event => { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); } }}
        onKeyDown={event => {
          if (event.target !== event.currentTarget) return;
          const delta = { ArrowLeft: [40,0], ArrowRight: [-40,0], ArrowUp: [0,40], ArrowDown: [0,-40] }[event.key];
          if (delta) { event.preventDefault(); updateView({ ...viewRef.current, x:viewRef.current.x+delta[0], y:viewRef.current.y+delta[1] }); }
        }}>
        <div className={styles.world} style={{ width:layout.width, height:layout.height, transform:`translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
          <svg width={layout.width} height={layout.height} className={styles.edges} aria-hidden="true">
            <defs><marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1 L7 4 L1 7" /></marker></defs>
            {layout.edges.map(edge => {
              const parent=positions.get(edge.parent)!, child=positions.get(edge.child)!;
              const x1=parent.x+lineageNodeSize.width,y1=parent.y+lineageNodeSize.height/2,x2=child.x,y2=child.y+lineageNodeSize.height/2;
              return <path key={edge.child} d={`M${x1} ${y1} C${(x1+x2)/2} ${y1},${(x1+x2)/2} ${y2},${x2} ${y2}`} markerEnd={`url(#${markerId})`} />;
            })}
          </svg>
          {layout.nodes.map(node => {
            const version=byId.get(node.id)!;
            const parent = byId.get(validParents.get(node.id) ?? "");
            const recommended = !version.withdrawn && recommendedIds.includes(version.id);
            let repository="";
            try { repository = new URL(version.repo).pathname.replace(/^\//, "").replace(/\/$/, ""); } catch { /* No usable repository label. */ }
            return <button type="button" key={node.id} className={styles.node} aria-pressed={selected===node.id}
              style={{ left:node.x,top:node.y,width:lineageNodeSize.width,height:lineageNodeSize.height }}
              onFocus={event => { if (event.currentTarget.matches(":focus-visible")) reveal(node.id); }} onClick={() => setSelected(node.id)} aria-controls={`${graphId}-details`}
              aria-label={`${version.label}, ${version.type}${parent ? `, based on ${parent.label}` : ""}${node.issue ? `, ${lineageIssueLabels[node.issue]}` : ""}${recommended ? ", recommended" : ""}${version.withdrawn ? ", withdrawn" : ""}`}>
              <span className={styles.badges}><span className="community-tag">{version.type}</span>
                {recommended && <span className="community-tag community-recommended">Recommended</span>}
                {version.withdrawn && <span className="community-tag community-tag-neutral">Withdrawn</span>}</span>
              <strong>{version.label}</strong><span className={styles.repository}>{repository}</span>
              <span className={styles.authors}>{version.authors || "Authors not recorded"}</span>
              {node.issue && <span className={styles.issue}>{lineageIssueLabels[node.issue]}</span>}
            </button>;
          })}
        </div>
      </div>
      <p id={`${graphId}-help`} className={styles.help}>Drag to pan · Pinch or use + / − to zoom · Arrow keys pan the focused canvas</p>
      {layout.nodes.some(node=>node.issue) && <p className={styles.warning} role="status">Some parent relationships are unavailable or invalid. Those versions are shown without a connecting parent.</p>}
      <p className={styles.selection} role="status">Selected version: {versions[currentIndex]?.label}</p>
    </div>}
    <ul id={open ? `${graphId}-details` : undefined} className={`community-record-list ${styles.details}`}>
      {open ? details[currentIndex] : latestId ? details[Math.max(0, versions.findIndex(version => version.id === latestId))] : details}
    </ul>
  </section>;
}
