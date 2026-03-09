/* eslint-disable */
/**
 * AIRenderer - Converts diagram JSON into shapes on the canvas.
 *
 * Two entry points:
 * 1. renderAIDiagram(diagram) - from AI text-to-diagram response
 * 2. window.__mermaidRenderer(src) - direct algorithmic Mermaid parser
 *
 * All created shapes (nodes, labels, arrows) belong to a Frame.
 * Node labels are TextShape objects with data-type="text-group" for full
 * interactivity (click-to-select, double-click-to-edit).
 * Edge labels are TextShape objects placed near the arrow midpoint.
 * All arrows are curved by default for clean non-overlapping routing.
 */

const PADDING = 80;
const NODE_W = 160;
const NODE_H = 60;
const H_SPACING = 260;
const V_SPACING = 180;
const NS = 'http://www.w3.org/2000/svg';

// ============================================================
// MERMAID PARSER
// ============================================================

export function parseMermaid(src) {
    const lines = src.trim().split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('%%'));
    if (lines.length === 0) return null;

    const headerMatch = lines[0].match(/^(graph|flowchart)\s+(TD|TB|LR|RL|BT)/i);
    const direction = headerMatch ? headerMatch[2].toUpperCase() : 'TD';
    const isHorizontal = direction === 'LR' || direction === 'RL';
    const startIdx = headerMatch ? 1 : 0;

    const nodesMap = new Map();
    const edges = [];

    function parseNodeRef(raw) {
        raw = raw.trim();
        if (!raw) return null;
        let id, label, type;

        let m = raw.match(/^(\w+)\(\((.+?)\)\)$/);
        if (m) { id = m[1]; label = m[2]; type = 'circle'; }
        if (!m) { m = raw.match(/^(\w+)\{(.+?)\}$/); if (m) { id = m[1]; label = m[2]; type = 'diamond'; } }
        if (!m) { m = raw.match(/^(\w+)\((.+?)\)$/); if (m) { id = m[1]; label = m[2]; type = 'circle'; } }
        if (!m) { m = raw.match(/^(\w+)\[(.+?)\]$/); if (m) { id = m[1]; label = m[2]; type = 'rectangle'; } }
        if (!m) { id = raw; label = raw; type = 'rectangle'; }

        if (!nodesMap.has(id)) {
            nodesMap.set(id, { id, type, label });
        } else if (label !== id) {
            nodesMap.get(id).label = label;
            nodesMap.get(id).type = type;
        }
        return id;
    }

    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].replace(/;$/, '').trim();
        if (!line) continue;

        let match = line.match(/^(.+?)\s*--\s*(.+?)\s*-->\s*(.+)$/);
        if (match) {
            const fromId = parseNodeRef(match[1].trim());
            const toId = parseNodeRef(match[3].trim());
            if (fromId && toId) edges.push({ from: fromId, to: toId, label: match[2].trim() });
            continue;
        }

        match = line.match(/^(.+?)\s*(-{1,2}>|={1,2}>|-.->|-->)\s*(?:\|([^|]*)\|)?\s*(.+)$/);
        if (match) {
            const fromId = parseNodeRef(match[1].trim());
            const toId = parseNodeRef(match[4].trim());
            const edgeLabel = match[3] ? match[3].trim() : undefined;
            if (fromId && toId) edges.push({ from: fromId, to: toId, label: edgeLabel });
            continue;
        }

        parseNodeRef(line);
    }

    if (nodesMap.size === 0) return null;

    // Topological BFS layering
    const nodeIds = Array.from(nodesMap.keys());
    const children = new Map();
    const parents = new Map();
    nodeIds.forEach(id => { children.set(id, []); parents.set(id, []); });
    edges.forEach(e => {
        if (children.has(e.from)) children.get(e.from).push(e.to);
        if (parents.has(e.to)) parents.get(e.to).push(e.from);
    });

    const layers = new Map();
    const roots = nodeIds.filter(id => parents.get(id).length === 0);
    if (roots.length === 0) roots.push(nodeIds[0]);

    const queue = roots.map(id => ({ id, layer: 0 }));
    const visited = new Set();
    while (queue.length > 0) {
        const { id, layer } = queue.shift();
        if (visited.has(id)) { if (layer > (layers.get(id) || 0)) layers.set(id, layer); continue; }
        visited.add(id);
        layers.set(id, Math.max(layer, layers.get(id) || 0));
        for (const child of children.get(id) || []) queue.push({ id: child, layer: layer + 1 });
    }
    nodeIds.forEach(id => { if (!visited.has(id)) layers.set(id, 0); });

    const layerGroups = new Map();
    layers.forEach((layer, id) => {
        if (!layerGroups.has(layer)) layerGroups.set(layer, []);
        layerGroups.get(layer).push(id);
    });

    const nodes = [];
    Array.from(layerGroups.keys()).sort((a, b) => a - b).forEach((layerIdx, li) => {
        const group = layerGroups.get(layerIdx);
        const startOffset = -(group.length * H_SPACING) / 2 + H_SPACING / 2;
        group.forEach((id, gi) => {
            const nd = nodesMap.get(id);
            const x = isHorizontal ? li * H_SPACING : startOffset + gi * H_SPACING;
            const y = isHorizontal ? startOffset + gi * V_SPACING : li * V_SPACING;
            nodes.push({ id: nd.id, type: nd.type, label: nd.label, x, y, width: NODE_W, height: NODE_H });
        });
    });

    return { title: 'Mermaid Diagram', nodes, edges: edges.map(e => ({ from: e.from, to: e.to, label: e.label })) };
}

// ============================================================
// RENDER
// ============================================================

export function renderAIDiagram(diagram) {
    if (!diagram?.nodes?.length) { console.error('[AIRenderer] Invalid diagram'); return false; }

    const nodes = diagram.nodes;
    const edges = diagram.edges || [];
    const title = diagram.title || 'AI Diagram';

    if (!window.svg || !window.Frame || !window.Rectangle) {
        console.error('[AIRenderer] Engine not initialized');
        return false;
    }

    // Viewport center
    const vb = window.currentViewBox || { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    const vcx = vb.x + vb.width / 2;
    const vcy = vb.y + vb.height / 2;

    // Diagram bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + (n.width || NODE_W));
        maxY = Math.max(maxY, n.y + (n.height || NODE_H));
    });

    const dw = maxX - minX, dh = maxY - minY;
    const ox = vcx - dw / 2 - minX;
    const oy = vcy - dh / 2 - minY;

    // Create frame
    let frame;
    try {
        frame = new window.Frame(vcx - dw / 2 - PADDING, vcy - dh / 2 - PADDING, dw + PADDING * 2, dh + PADDING * 2, {
            stroke: '#888', strokeWidth: 2, fill: 'transparent', opacity: 1, frameName: title,
        });
        window.shapes.push(frame);
        if (window.pushCreateAction) window.pushCreateAction(frame);
    } catch (err) {
        console.error('[AIRenderer] Frame creation failed:', err);
        return false;
    }

    const nodeMap = new Map();

    // --- NODES ---
    for (const node of nodes) {
        const nx = node.x + ox, ny = node.y + oy;
        const nw = node.width || NODE_W, nh = node.height || NODE_H;
        const cx = nx + nw / 2, cy = ny + nh / 2;
        let shape = null;

        try {
            if (node.type === 'circle' && window.Circle) {
                shape = new window.Circle(cx, cy, nw / 2, nh / 2, {
                    stroke: '#e0e0e0', strokeWidth: 1.5, fill: 'transparent', roughness: 1,
                });
            } else if (node.type === 'diamond' && window.Rectangle) {
                const sz = Math.max(nw, nh) * 0.7;
                shape = new window.Rectangle(cx - sz / 2, cy - sz / 2, sz, sz, {
                    stroke: '#e0e0e0', strokeWidth: 1.5, fill: 'transparent', roughness: 1,
                });
                if (shape.element) {
                    shape.element.setAttribute('transform', `rotate(45, ${sz / 2}, ${sz / 2})`);
                }
            } else if (window.Rectangle) {
                shape = new window.Rectangle(nx, ny, nw, nh, {
                    stroke: '#e0e0e0', strokeWidth: 1.5, fill: 'transparent', roughness: 1,
                });
            }
        } catch (err) {
            console.warn('[AIRenderer] Node creation failed:', node.id, err);
            continue;
        }

        if (!shape) continue;

        window.shapes.push(shape);
        if (window.pushCreateAction) window.pushCreateAction(shape);
        if (frame.addShapeToFrame) frame.addShapeToFrame(shape);

        nodeMap.set(node.id, { shape, x: nx, y: ny, width: nw, height: nh, centerX: cx, centerY: cy });

        // Node label as a proper interactive TextShape
        if (node.label) {
            createLabel(node.label, cx, cy, 14, '#e0e0e0', frame);
        }
    }

    // --- EDGES ---
    // Pre-compute fan-out counts per source node so we can spread arrows
    const fanOut = new Map();
    const fanIdx = new Map();
    edges.forEach(e => {
        fanOut.set(e.from, (fanOut.get(e.from) || 0) + 1);
        fanIdx.set(e, fanOut.get(e.from) - 1);
    });

    for (const edge of edges) {
        const from = nodeMap.get(edge.from), to = nodeMap.get(edge.to);
        if (!from || !to) continue;

        const count = fanOut.get(edge.from) || 1;
        const idx = fanIdx.get(edge);

        // Spread connection ports along the exit edge when fan-out > 1
        const sp = getSpreadEdgePoint(from, to, count, idx);
        const ep = getEdgePoint(to, from);

        // Nudge slightly away from node boundaries
        const adx = ep.x - sp.x, ady = ep.y - sp.y;
        const alen = Math.sqrt(adx * adx + ady * ady) || 1;
        const nudge = 6;
        const spN = { x: sp.x + (adx / alen) * nudge, y: sp.y + (ady / alen) * nudge };
        const epN = { x: ep.x - (adx / alen) * nudge, y: ep.y - (ady / alen) * nudge };

        if (window.Arrow) {
            try {
                // All arrows curved by default for clean diagram routing
                // Fan-out > 1: spread curve amounts so arrows diverge
                // Single edge: gentle curve to look professional
                let curveAmount;
                if (count > 1) {
                    curveAmount = 40 + (idx - (count - 1) / 2) * 35;
                } else {
                    curveAmount = 30; // gentle default curve
                }

                const arrow = new window.Arrow(spN, epN, {
                    stroke: '#e0e0e0', strokeWidth: 1.5, roughness: 1,
                    arrowCurved: 'curved',
                    arrowCurveAmount: curveAmount,
                });
                window.shapes.push(arrow);
                if (window.pushCreateAction) window.pushCreateAction(arrow);
                if (frame.addShapeToFrame) frame.addShapeToFrame(arrow);
            } catch (err) {
                console.warn('[AIRenderer] Arrow creation failed:', edge, err);
            }
        }

        // Edge label near arrow midpoint
        if (edge.label) {
            const mx = (spN.x + epN.x) / 2;
            const my = (spN.y + epN.y) / 2 - 18;
            createLabel(edge.label, mx, my, 11, '#a0a0b0', frame);
        }
    }

    // Auto-select the frame and show its sidebar
    window.currentShape = frame;
    if (frame.selectFrame) frame.selectFrame();
    if (window.__sketchStoreApi) window.__sketchStoreApi.setSelectedShapeSidebar('frame');

    console.log(`[AIRenderer] Done: ${nodes.length} nodes, ${edges.length} edges → "${title}"`);
    return true;
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Create an interactive TextShape label at (x, y) and add it to the frame.
 * Sets data-type="text-group" so the text tool recognizes it for
 * click-to-select and double-click-to-edit.
 */
function createLabel(text, x, y, fontSize, fill, frame) {
    const svg = window.svg;
    if (!svg || !window.TextShape) return null;

    try {
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('data-type', 'text-group');
        g.setAttribute('transform', `translate(${x}, ${y})`);
        g.setAttribute('data-x', x);
        g.setAttribute('data-y', y);

        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', 0);
        t.setAttribute('y', 0);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('dominant-baseline', 'central');
        t.setAttribute('fill', fill);
        t.setAttribute('font-size', fontSize);
        t.setAttribute('font-family', 'lixFont, sans-serif');
        t.setAttribute('data-initial-font', 'lixFont');
        t.setAttribute('data-initial-color', fill);
        t.setAttribute('data-initial-size', fontSize + 'px');
        t.textContent = text;

        g.appendChild(t);
        svg.appendChild(g);

        const shape = new window.TextShape(g);
        window.shapes.push(shape);
        if (window.pushCreateAction) window.pushCreateAction(shape);
        if (frame?.addShapeToFrame) frame.addShapeToFrame(shape);
        return shape;
    } catch (err) {
        console.warn('[AIRenderer] Label creation failed:', err);
        return null;
    }
}

/**
 * Like getEdgePoint but spreads multiple connections along the exit edge.
 * count = total edges leaving this side, idx = 0-based index of this edge.
 */
function getSpreadEdgePoint(node, targetNode, count, idx) {
    if (count <= 1) return getEdgePoint(node, targetNode);

    const dx = targetNode.centerX - node.centerX;
    const dy = targetNode.centerY - node.centerY;
    const hw = node.width / 2;
    const hh = node.height / 2;

    // Spread ratio: distribute along 60% of the edge length
    const spread = 0.6;
    const t = count === 1 ? 0.5 : idx / (count - 1);
    const offset = (t - 0.5) * spread;

    if (Math.abs(dx) < 0.001 || Math.abs(dy) * hw > Math.abs(dx) * hh) {
        const px = node.centerX + offset * node.width;
        const py = dy > 0 ? node.y + node.height : node.y;
        return { x: px, y: py };
    }
    const px = dx > 0 ? node.x + node.width : node.x;
    const py = node.centerY + offset * node.height;
    return { x: px, y: py };
}

/**
 * Get the connection point on a node's boundary toward another node.
 * Uses the angle between centers to pick the closest edge (top/bottom/left/right).
 */
function getEdgePoint(node, targetNode) {
    const dx = targetNode.centerX - node.centerX;
    const dy = targetNode.centerY - node.centerY;
    const hw = node.width / 2;
    const hh = node.height / 2;

    if (Math.abs(dx) < 0.001 || Math.abs(dy) * hw > Math.abs(dx) * hh) {
        if (dy > 0) return { x: node.centerX, y: node.y + node.height };
        return { x: node.centerX, y: node.y };
    }
    if (dx > 0) return { x: node.x + node.width, y: node.centerY };
    return { x: node.x, y: node.centerY };
}

export function initAIRenderer() {
    window.__aiRenderer = renderAIDiagram;
    window.__mermaidRenderer = (src) => {
        const diagram = parseMermaid(src);
        if (!diagram) { console.error('[AIRenderer] Mermaid parse failed'); return false; }
        return renderAIDiagram(diagram);
    };
}
