import { drawBackground, setupRings } from './background.js';
import { planktons, createPlankton, drawPlanktons, updatePlanktons } from './plankton.js';
import { updatePlanktonEnergy, updateEnvironment, drawEnvironment } from './energy.js';

const bgCanvas = document.getElementById('bgCanvas');
const mainCanvas = document.getElementById('mainCanvas');
bgCanvas.width = mainCanvas.width = window.innerWidth;
bgCanvas.height = mainCanvas.height = window.innerHeight;

export const bgCtx = bgCanvas.getContext('2d');
export const ctx = mainCanvas.getContext('2d');

setupRings(bgCanvas.width, bgCanvas.height);

// 🐣 初期個体生成
for (let i = 0; i < 10; i++) {
  planktons.push(createPlankton(i, Math.random() * mainCanvas.width, Math.random() * mainCanvas.height));
}

// 🎞️ アニメーションループ（残像最適化済）
function animate(t) {
  drawBackground(t);                 // 幾何学背景レイヤー（bgCanvas）

  // 🧼 フェード塗りで残像軽減
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; // ← ここで残像感を調整（低いほど薄く）
  ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

  updateEnvironment();              // 💩→🌱環境進化
  updatePlanktons(t);              // 個体移動
  updatePlanktonEnergy(t);         // 捕食・エネルギー処理
  drawEnvironment();               // フン・植物描画
  drawPlanktons(t);                // 個体描画

  requestAnimationFrame(animate);
}

animate(0);
