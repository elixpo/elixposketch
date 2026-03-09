/* eslint-disable */
/**
 * AIRenderer - Converts AI-generated diagram JSON into shapes on the canvas.
 *
 * Takes a diagram object with nodes[] and edges[] and creates:
 * - A Frame containing all shapes
 * - Rectangle/Circle shapes for nodes
 * - Arrow shapes for edges
 * - Text labels on nodes and edges
 */

const PADDING = 40;

/**
 * Render AI diagram JSON onto the canvas inside a Frame.
 * @param {Object} diagram - { title, nodes[], edges[] }
 */
export function renderAIDiagram(diagram) {
    if (!diagram || !diagram.nodes || !Array.isArray(diagram.nodes)) {
        console.error('[AIRenderer] Invalid diagram data');
        return;
    }

    const nodes = diagram.nodes;
    const edges = diagram.edges || [];
    const title = diagram.title || 'AI Diagram';

    // Calculate canvas center based on current viewport
    const vb = window.currentViewBox || { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    const viewCenterX = vb.x + vb.width / 2;
    const viewCenterY = vb.y + vb.height / 2;

    // Calculate diagram bounds from node positions
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
        const w = node.width || 160;
        const h = node.height || 60;
        if (node.x < minX) minX = node.x;
        if (node.y < minY) minY = node.y;
        if (node.x + w > maxX) maxX = node.x + w;
        if (node.y + h > maxY) maxY = node.y + h;
    });

    const diagramWidth = maxX - minX;
    const diagramHeight = maxY - minY;

    // Offset to center diagram in viewport
    const offsetX = viewCenterX - diagramWidth / 2 - minX;
    const offsetY = viewCenterY - diagramHeight / 2 - minY;

    // Create the frame first
    const frameX = viewCenterX - diagramWidth / 2 - PADDING;
    const frameY = viewCenterY - diagramHeight / 2 - PADDING;
    const frameW = diagramWidth + PADDING * 2;
    const frameH = diagramHeight + PADDING * 2;

    let frame = null;
    if (window.Frame) {
        frame = new window.Frame(frameX, frameY, frameW, frameH, {
            stroke: '#4a9eff',
            strokeWidth: 1,
        });
        frame.setTitle(title);
        if (typeof shapes !== 'undefined') shapes.push(frame);
        if (typeof pushCreateAction === 'function') pushCreateAction(frame);
    }

    // Map node IDs to their created shapes and positions for edge connections
    const nodeMap = new Map();

    // Create nodes
    nodes.forEach(node => {
        const nx = node.x + offsetX;
        const ny = node.y + offsetY;
        const nw = node.width || 160;
        const nh = node.height || 60;

        let shape = null;

        if (node.type === 'circle') {
            if (window.Circle) {
                const rx = nw / 2;
                const ry = nh / 2;
                shape = new window.Circle(nx + rx, ny + ry, rx, ry, {
                    stroke: '#e0e0e0',
                    strokeWidth: 1.5,
                    fill: 'transparent',
                    roughness: 1,
                });
            }
        } else if (node.type === 'diamond') {
            // Diamond rendered as a rotated rectangle
            if (window.Rectangle) {
                const size = Math.max(nw, nh) * 0.7;
                shape = new window.Rectangle(
                    nx + nw / 2 - size / 2,
                    ny + nh / 2 - size / 2,
                    size, size, {
                        stroke: '#e0e0e0',
                        strokeWidth: 1.5,
                        fill: 'transparent',
                        roughness: 1,
                    }
                );
                // Rotate 45 degrees
                if (shape.element) {
                    const cx = nx + nw / 2;
                    const cy = ny + nh / 2;
                    shape.element.setAttribute('transform', `rotate(45, ${cx}, ${cy})`);
                }
            }
        } else {
            // Default: rectangle
            if (window.Rectangle) {
                shape = new window.Rectangle(nx, ny, nw, nh, {
                    stroke: '#e0e0e0',
                    strokeWidth: 1.5,
                    fill: 'transparent',
                    roughness: 1,
                });
            }
        }

        if (shape) {
            if (typeof shapes !== 'undefined') shapes.push(shape);
            if (typeof pushCreateAction === 'function') pushCreateAction(shape);

            // Add to frame
            if (frame && typeof frame.addShapeToFrame === 'function') {
                frame.addShapeToFrame(shape);
            }

            nodeMap.set(node.id, {
                shape,
                x: nx,
                y: ny,
                width: nw,
                height: nh,
                centerX: nx + nw / 2,
                centerY: ny + nh / 2,
            });
        }

        // Add label as text
        if (node.label && window.TextShape) {
            addTextLabel(
                node.label,
                nx + nw / 2,
                ny + nh / 2,
                frame
            );
        }
    });

    // Create edges as arrows
    edges.forEach(edge => {
        const fromNode = nodeMap.get(edge.from);
        const toNode = nodeMap.get(edge.to);
        if (!fromNode || !toNode) return;

        // Calculate connection points (bottom of source -> top of target by default)
        const startPoint = getConnectionPoint(fromNode, toNode);
        const endPoint = getConnectionPoint(toNode, fromNode, true);

        if (window.Arrow) {
            const arrow = new window.Arrow(startPoint, endPoint, {
                stroke: '#e0e0e0',
                strokeWidth: 1.5,
                roughness: 1,
            });

            if (typeof shapes !== 'undefined') shapes.push(arrow);
            if (typeof pushCreateAction === 'function') pushCreateAction(arrow);

            if (frame && typeof frame.addShapeToFrame === 'function') {
                frame.addShapeToFrame(arrow);
            }

            // Attach arrow to shapes
            if (fromNode.shape && arrow.setStartAttachment) {
                arrow.setStartAttachment(fromNode.shape);
            }
            if (toNode.shape && arrow.setEndAttachment) {
                arrow.setEndAttachment(toNode.shape);
            }
        }

        // Add edge label
        if (edge.label && window.TextShape) {
            const midX = (startPoint.x + endPoint.x) / 2;
            const midY = (startPoint.y + endPoint.y) / 2;
            addTextLabel(edge.label, midX, midY - 10, frame, 10);
        }
    });

    console.log(`[AIRenderer] Rendered ${nodes.length} nodes, ${edges.length} edges in frame "${title}"`);
}

/**
 * Calculate connection point on a node's edge facing another node.
 */
function getConnectionPoint(fromNode, toNode, isTarget = false) {
    const dx = toNode.centerX - fromNode.centerX;
    const dy = toNode.centerY - fromNode.centerY;

    const hw = fromNode.width / 2;
    const hh = fromNode.height / 2;

    // Determine which side to connect from
    if (isTarget) {
        // Entry point - from opposite direction
        if (Math.abs(dy) * hw > Math.abs(dx) * hh) {
            // Top or bottom
            return dy < 0
                ? { x: fromNode.centerX, y: fromNode.y + fromNode.height } // bottom
                : { x: fromNode.centerX, y: fromNode.y }; // top
        } else {
            return dx < 0
                ? { x: fromNode.x + fromNode.width, y: fromNode.centerY } // right
                : { x: fromNode.x, y: fromNode.centerY }; // left
        }
    } else {
        // Exit point
        if (Math.abs(dy) * hw > Math.abs(dx) * hh) {
            return dy > 0
                ? { x: fromNode.centerX, y: fromNode.y + fromNode.height } // bottom
                : { x: fromNode.centerX, y: fromNode.y }; // top
        } else {
            return dx > 0
                ? { x: fromNode.x + fromNode.width, y: fromNode.centerY } // right
                : { x: fromNode.x, y: fromNode.centerY }; // left
        }
    }
}

/**
 * Add a text label at position. Creates a SVG text element wrapped in TextShape.
 */
function addTextLabel(text, x, y, frame, fontSize = 14) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = window.svg;
    if (!svg) return;

    const group = document.createElementNS(ns, 'g');
    const textEl = document.createElementNS(ns, 'text');
    textEl.setAttribute('x', x);
    textEl.setAttribute('y', y);
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('dominant-baseline', 'central');
    textEl.setAttribute('fill', '#e0e0e0');
    textEl.setAttribute('font-size', fontSize);
    textEl.setAttribute('font-family', 'lixFont, sans-serif');
    textEl.textContent = text;

    group.appendChild(textEl);
    svg.appendChild(group);

    const textShape = new window.TextShape(group);
    if (typeof shapes !== 'undefined') shapes.push(textShape);
    if (typeof pushCreateAction === 'function') pushCreateAction(textShape);

    if (frame && typeof frame.addShapeToFrame === 'function') {
        frame.addShapeToFrame(textShape);
    }

    return textShape;
}

/**
 * Initialize the AI renderer bridge so the React modal can trigger rendering.
 */
export function initAIRenderer() {
    window.__aiRenderer = renderAIDiagram;
}
