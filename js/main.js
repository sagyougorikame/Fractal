import { rand } from './utils.js';
import { Fractal } from './fractal.js';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export const fractals = [];

// 🌱 初期個体を生成（植物＋動物ランダム）
for (let i = 0; i < 20; i++) {
  const dna = Fractal.generateRandomDNA();
  const x = rand(100, canvas.width - 100);
  const y = rand(100, canvas.height - 100);
  fractals.push(new Fractal(dna, x, y));
}

let generationCounter = 0;
let frameCount = 0;

function evolutionCycle() {
  if (fractals.length < 10) return;

  fractals.sort((a, b) => b.getFitness() - a.getFitness());
  const cullCount = Math.floor(fractals.length * 0.3);
  const survivors = fractals.slice(0, fractals.length - cullCount);
  const parents = survivors.slice(0, 5);

  for (let i = 0; i < cullCount; i++) {
    const parent = parents[Math.floor(Math.random() * parents.length)];
    const newDNA = parent.mutateDNA();
    const x = rand(100, canvas.width - 100);
    const y = rand(100, canvas.height - 100);
    survivors.push(new Fractal(newDNA, x, y));
  }

  fractals.length = 0;
  fractals.push(...survivors);
  generationCounter++;
  console.log(`🌱 Generation ${generationCounter}`);
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let f of fractals) {
    f.update(fractals);
    if (!f.dead) f.draw(ctx);
  }

  frameCount++;
  if (frameCount % 600 === 0) {
    evolutionCycle();
  }

  requestAnimationFrame(animate);
}

animate();
