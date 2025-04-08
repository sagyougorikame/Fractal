import { generateDNA } from './dna.js';
import { rand } from './utils.js';
import { ctx } from './main.js';

export const planktons = [];

export function createPlankton(id, x, y, parentDNA = null) {
  const dna = generateDNA(parentDNA);
  const shape = dna.shape;
  const segmentCount = Math.floor(rand(6, 12));
  const segments = [];

  for (let i = 0; i < segmentCount; i++) {
    let radius = dna.traits.size;
    if (shape === "worm") radius = 10 + Math.sin(i * 0.5) * 3;
    if (shape === "fish") radius = 18 - i * 1.2;
    if (shape === "jelly") radius = 18 - Math.abs(i - segmentCount / 2) * 1.1;
    segments.push({ x: x - i * 20, y: y, radius: Math.max(6, radius) });
  }

  const tentacles = [];
  for (let i = 0; i < rand(2, 5); i++) {
    tentacles.push({
      segmentIndex: Math.floor(rand(segments.length / 2, segments.length)),
      angleOffset: rand(-0.4, 0.4),
      length: rand(40, 80)
    });
  }

  return {
    id, dna, movementType: shape, segments,
    vx: 0, vy: 0,
    angle: rand(0, Math.PI * 2),
    speed: dna.traits.speed,
    colorHue: dna.colorHue,
    pulsePhase: rand(0, Math.PI * 2),
    swayTime: rand(0, 1000),
    tentacles,
    generation: parentDNA ? parentDNA.generation + 1 : 1,
    energy: 100,
    parentId: parentDNA ? parentDNA.id : null
  };
}

export function updatePlanktons(t) {
  planktons.forEach(p => {
    if (p.dead) return;

    const head = p.segments[0];

    if (p.movementType === "worm") {
      p.vx += Math.cos(p.angle) * 0.05;
      p.vy += Math.sin(p.angle) * 0.05;
    } else if (p.movementType === "fish") {
      const sway = Math.sin(t * 0.05 + p.swayTime) * 0.4;
      p.angle += sway * 0.03;
      p.vx += Math.cos(p.angle) * 0.1;
      p.vy += Math.sin(p.angle) * 0.1;
    } else if (p.movementType === "jelly") {
      const pulse = Math.sin(t * 0.01 + p.pulsePhase);
      if (pulse > 0.98) {
        p.vx += Math.cos(p.angle) * 1.5;
        p.vy += Math.sin(p.angle) * 1.5;
      }
    }

    p.vx *= 0.96;
    p.vy *= 0.96;
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > p.speed) {
      p.vx *= 0.95;
      p.vy *= 0.95;
    }

    head.x += p.vx;
    head.y += p.vy;
    const angleTo = Math.atan2(p.vy, p.vx);
    p.angle += (angleTo - p.angle) * 0.05;

    for (let i = 1; i < p.segments.length; i++) {
      const prev = p.segments[i - 1];
      const curr = p.segments[i];
      const dx = prev.x - curr.x;
      const dy = prev.y - curr.y;
      const dist = Math.hypot(dx, dy);
      const desired = 20;
      const ratio = (dist - desired) * 0.5;
      const angle = Math.atan2(dy, dx);
      curr.x += Math.cos(angle) * ratio;
      curr.y += Math.sin(angle) * ratio;
    }
  });
}

function drawTentacle(x, y, angle, length, time, hue) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  const segments = 10;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const sway = Math.sin(time * 0.01 + i * 0.5) * 5;
    const dx = Math.cos(angle) * length * t + Math.cos(angle + Math.PI / 2) * sway;
    const dy = Math.sin(angle) * length * t + Math.sin(angle + Math.PI / 2) * sway;
    ctx.lineTo(x + dx, y + dy);
  }
  ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
  ctx.lineWidth = 2;
  ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
  ctx.shadowBlur = 10;
  ctx.stroke();
}

export function drawPlanktons(t) {
  planktons.forEach(p => {
    if (p.dead) return;

    const left = [], right = [];
    for (let i = 0; i < p.segments.length; i++) {
      const s = p.segments[i];
      const prev = p.segments[i - 1] || s;
      const next = p.segments[i + 1] || s;
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const angle = Math.atan2(dy, dx);
      const offsetX = Math.cos(angle + Math.PI / 2) * s.radius;
      const offsetY = Math.sin(angle + Math.PI / 2) * s.radius;
      left.push({ x: s.x + offsetX, y: s.y + offsetY });
      right.unshift({ x: s.x - offsetX, y: s.y - offsetY });
    }

    const outline = left.concat(right);
    ctx.beginPath();
    ctx.moveTo(outline[0].x, outline[0].y);
    for (let i = 1; i < outline.length; i++) {
      const p0 = outline[i];
      const p1 = outline[(i + 1) % outline.length];
      const xc = (p0.x + p1.x) / 2;
      const yc = (p0.y + p1.y) / 2;
      ctx.quadraticCurveTo(p0.x, p0.y, xc, yc);
    }
    ctx.closePath();
    ctx.fillStyle = `hsl(${p.colorHue}, 100%, 50%)`;
    ctx.shadowColor = `hsl(${p.colorHue}, 100%, 70%)`;
    ctx.shadowBlur = 30;
    ctx.fill();

    // Tentacles
    p.tentacles.forEach(tentacle => {
      const s = p.segments[tentacle.segmentIndex];
      const next = p.segments[tentacle.segmentIndex + 1] || s;
      const dx = next.x - s.x;
      const dy = next.y - s.y;
      const baseAngle = Math.atan2(dy, dx) + Math.PI / 2 + tentacle.angleOffset;
      const anchorX = s.x + Math.cos(baseAngle) * (s.radius * 0.7);
      const anchorY = s.y + Math.sin(baseAngle) * (s.radius * 0.7);
      drawTentacle(anchorX, anchorY, baseAngle, tentacle.length, t, p.colorHue);
    });
  });
}
