import { planktons } from './plankton.js';
import { ctx } from './main.js';

// 💩 フン → 🌱 植物へ
export const poops = [];
export const plants = [];

export function createPoop(x, y) {
  return {
    x, y,
    age: 0,
    lifespan: 500,
    type: "poop"
  };
}

export function createPlant(x, y) {
  return {
    x, y,
    energy: 50,
    type: "plant"
  };
}

export function updateEnvironment() {
  // 💩 → 🌱 変換
  for (let i = poops.length - 1; i >= 0; i--) {
    const poop = poops[i];
    poop.age++;
    if (poop.age > poop.lifespan) {
      plants.push(createPlant(poop.x, poop.y));
      poops.splice(i, 1);
    }
  }
}

export function updatePlanktonEnergy(time) {
  planktons.forEach(p => {
    if (p.dead) return;

    p.energy -= 0.02;

    if (p.energy <= 0) {
      p.dead = true;
      return;
    }

    let target = null;

    // 🌱植物を食べる
    if (p.movementType !== "jelly") {
      for (let plant of plants) {
        const dx = plant.x - p.segments[0].x;
        const dy = plant.y - p.segments[0].y;
        const d = Math.hypot(dx, dy);
        if (d < 100) {
          target = plant;
          break;
        }
      }
    }

    // 💩を食べる（雑食想定）
    if (!target) {
      for (let poop of poops) {
        if (poop.type === "plant") continue;
        const dx = poop.x - p.segments[0].x;
        const dy = poop.y - p.segments[0].y;
        const d = Math.hypot(dx, dy);
        if (d < 100) {
          target = poop;
          break;
        }
      }
    }

    if (target) {
      const dx = target.x - p.segments[0].x;
      const dy = target.y - p.segments[0].y;
      const d = Math.hypot(dx, dy);

      if (d < 10) {
        p.energy += 30;

        if (target.type === "plant") {
          target.energy -= 30;
          if (target.energy <= 0) {
            plants.splice(plants.indexOf(target), 1);
          }
        } else {
          poops.splice(poops.indexOf(target), 1);
        }

        // フン排泄
        const last = p.segments[p.segments.length - 1];
        poops.push(createPoop(last.x, last.y));

      } else {
        p.vx += (dx / d) * 0.05;
        p.vy += (dy / d) * 0.05;
      }
    }
  });
}

export function drawEnvironment() {
  poops.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180,140,100,0.3)`;
    ctx.fill();
  });

  plants.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(100,255,100,0.4)`;
    ctx.fill();
  });
}
