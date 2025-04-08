import { bgCtx } from './main.js';

let rings = [];

export function setupRings(width, height) {
  rings = [];
  for (let i = 0; i < 40; i++) {
    rings.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 20 + Math.random() * 80,
      phase: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.004,
      baseAlpha: 0.03 + Math.random() * 0.05,
      hue: 210 + Math.random() * 60
    });
  }
}

export function drawBackground(time) {
  bgCtx.clearRect(0, 0, bgCtx.canvas.width, bgCtx.canvas.height);
  bgCtx.fillStyle = "#080810";
  bgCtx.fillRect(0, 0, bgCtx.canvas.width, bgCtx.canvas.height);

  rings.forEach(r => {
    const pulse = Math.sin(time * r.speed + r.phase) * 0.5 + 0.5;
    const alpha = r.baseAlpha + pulse * 0.02;

    bgCtx.beginPath();
    bgCtx.arc(r.x, r.y, r.r + pulse * 20, 0, Math.PI * 2);
    bgCtx.strokeStyle = `hsla(${r.hue}, 50%, 60%, ${alpha})`;
    bgCtx.lineWidth = 1 + pulse * 2;
    bgCtx.stroke();
  });
}
