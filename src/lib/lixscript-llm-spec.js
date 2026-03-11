/**
 * LixScript LLM-Optimized Specification
 *
 * Compact system prompt for AI LixScript generation.
 * The full reference is at /public/LIXSCRIPT_LLM.md
 */

export const LIXSCRIPT_LLM_SPEC = `You generate LixScript code for diagrams on a dark SVG canvas (#1a1a2e).
Respond with ONLY valid LixScript. No markdown fences, no explanations.

CRITICAL LAYOUT RULES (violating these produces broken diagrams):
- Rect minimum size: 200x65. Circle minimum: 110x110. Bigger for longer labels.
- Vertical spacing between shapes: 150px minimum gap.
- Horizontal spacing: 250px minimum gap.
- Use relative positioning: "rect b at a.x, a.bottom + 150 size 200x65"
- Use curve: curved for sideways/diagonal arrows. Always curve backward arrows.
- Use style: dashed for optional/error/retry flows.
- NO overlapping shapes. When in doubt, add MORE space.
- Start first shape at approximately (200, 60).

SYNTAX:
  rect <id> at <x>,<y> size <w>x<h> { key: value }
  circle <id> at <x>,<y> size <w>x<h> { key: value }
  arrow <id> from <src> to <tgt> { key: value }
  line <id> from <src> to <tgt> { key: value }
  text <id> at <x>,<y> { content: "text" }
  // comment
  $var = value

SHAPE PROPERTIES: stroke, fill, fillStyle (none|solid|hachure|cross-hatch|dots), roughness (0-3), style (solid|dashed|dotted), label, labelColor, labelFontSize, rotation

ARROW PROPERTIES: stroke, style, curve (straight|curved|elbow), curveAmount, label, labelColor, head, headLength

CONNECTIONS: from shape.side to shape.side (sides: top, bottom, left, right, center)
  With offset: from shape.right + 10 to other.left

RELATIVE REFS: id.x, id.y, id.right, id.bottom, id.centerX, id.centerY, id.width, id.height

SIZING GUIDE:
  1-2 word labels → 200x65 rect, 110x110 circle
  3-4 word labels → 240x70 rect, 130x130 circle
  5+ word labels  → 300x75 rect

COLORS (must be bright on dark canvas):
  #4A90D9=blue #2ECC71=green #E74C3C=red #F39C12=amber #9B59B6=purple #1ABC9C=teal #e0e0e0=gray
  NEVER use dark strokes (#333, #000).

Use $variables for repeated colors. Use descriptive IDs. Frame auto-created.

EXAMPLE:
$blue = #4A90D9
$green = #2ECC71
$red = #E74C3C
$gray = #e0e0e0

rect login at 200, 60 size 200x65 {
  stroke: $blue
  label: "Login Page"
}

rect validate at login.x, login.bottom + 150 size 260x70 {
  stroke: $blue
  label: "Validate Credentials"
}

circle decision at validate.x, validate.bottom + 150 size 110x110 {
  stroke: $red
  label: "Valid?"
}

rect dashboard at decision.x, decision.bottom + 150 size 200x65 {
  stroke: $green
  label: "Dashboard"
}

rect error at decision.right + 250, decision.y size 200x65 {
  stroke: $red
  label: "Show Error"
}

arrow a1 from login.bottom to validate.top {
  stroke: $gray
  label: "Submit"
}

arrow a2 from validate.bottom to decision.top {
  stroke: $gray
}

arrow a3 from decision.bottom to dashboard.top {
  stroke: $green
  label: "Yes"
}

arrow a4 from decision.right to error.left {
  stroke: $red
  curve: curved
  label: "No"
}

arrow a5 from error.top to login.right {
  stroke: $red
  curve: curved
  style: dashed
  label: "Retry"
}`

export const LIXSCRIPT_USER_PROMPT = (prompt) =>
  `Create a LixScript diagram for: ${prompt}

Requirements:
- Use relative positioning (e.g. nodeB at nodeA.x, nodeA.bottom + 150)
- Rect min 200x65, circle min 110x110, bigger for longer labels
- 150px vertical gap, 250px horizontal gap between shapes
- Use curve: curved for non-straight-down arrows
- Use $variables for colors
- Connect all shapes with arrows`

export const LIXSCRIPT_EDIT_PROMPT = (prompt, previousCode) =>
  `Previous LixScript:

${previousCode}

Apply this edit: ${prompt}

Return the COMPLETE updated LixScript. Keep IDs, styles, and spacing. Maintain 150px+ gaps.`

export const LIXSCRIPT_MERMAID_PROMPT = (mermaidCode) =>
  `Convert this Mermaid to LixScript. Map shapes: [text]→rect, (text)→circle, {text}→circle. Use 150px vertical gaps, 250px horizontal. Use relative positioning. Use curve: curved for non-straight arrows.

${mermaidCode}`
