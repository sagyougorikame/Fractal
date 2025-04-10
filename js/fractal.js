import { rand } from './utils.js';

export class Fractal {
  constructor(dna, x, y) {
    this.dna = dna;
    this.x = x;
    this.y = y;
    this.gridSize = dna.gridSize;
    this.grid = this.generateGrid(dna.structure);
    this.energy = 100;
    this.metabolism = this.calcMetabolism();
    this.dead = false;
    this.age = 0;
    this.children = 0;
  }

  generateGrid(structure) {
    const grid = [];
    const size = this.gridSize;
    for (let y = 0; y < size; y++) {
      grid[y] = [];
      for (let x = 0; x < size; x++) {
        grid[y][x] = structure?.[y]?.[x] || (Math.random() < 0.2 ? "leaf" : "empty");
      }
    }
    grid[Math.floor(size / 2)][Math.floor(size / 2)] = "core";
    return grid;
  }

  calcMetabolism() {
    let usage = 0;
    for (let row of this.grid) {
      for (let cell of row) {
        if (cell !== "empty") usage++;
      }
    }
    return usage * 0.05;
  }

  update(fractals) {
    if (this.dead) return;

    this.energy -= this.metabolism;
    this.age++;

    // 🔥 動物型の行動
    if (this.dna.type === "animal") {
      const target = fractals.find(f =>
        f !== this && f.dna.type === "plant" && !f.dead
      );
      if (target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 5) {
          this.x += (dx / dist) * 0.5;
          this.y += (dy / dist) * 0.5;
        } else {
          this.energy += 30;
          target.energy -= 40;
          if (target.energy <= 0) target.dead = true;
        }
      }
    }

    // 🌱 成長
    if (this.dna.type === "plant" && this.energy > 120 && this.gridSize < 9) {
      this.gridSize += 2;
      this.grid = this.generateGrid(this.grid);
      this.metabolism = this.calcMetabolism();
      this.energy -= 20;
    }

    // 🧬 繁殖
    if (this.energy > 150 && this.children < 3) {
      const newDNA = this.mutateDNA();
      const offsetX = this.x + rand(-60, 60);
      const offsetY = this.y + rand(-60, 60);
      fractals.push(new Fractal(newDNA, offsetX, offsetY));
      this.children++;
      this.energy -= 50;
    }

    if (this.energy <= 0) {
      this.dead = true;
    }
  }

  mutateDNA() {
    const newStructure = this.grid.map(row =>
      row.map(cell => (Math.random() < 0.05 ? "leaf" : cell))
    );
    return {
      type: this.dna.type,
      gridSize: this.gridSize,
      structure: newStructure
    };
  }

  static generateRandomDNA(type = null) {
    const size = [3, 5, 7][Math.floor(Math.random() * 3)];
    const structure = [];
    for (let y = 0; y < size; y++) {
      structure[y] = [];
      for (let x = 0; x < size; x++) {
        const r = Math.random();
        if (r < 0.05) structure[y][x] = "core";
        else if (r < 0.3) structure[y][x] = "leaf";
        else if (r < 0.6) structure[y][x] = "arm";
        else structure[y][x] = "empty";
      }
    }
    return {
      type: type || (Math.random() < 0.4 ? "animal" : "plant"),
      gridSize: size,
      structure
    };
  }

  getFitness() {
    return this.age + this.energy + this.children * 30;
  }

  draw(ctx) {
    const cellSize = 12;
    const offset = Math.floor(this.gridSize / 2);
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const cell = this.grid[y][x];
        if (cell === "empty") continue;
        const px = this.x + (x - offset) * cellSize;
        const py = this.y + (y - offset) * cellSize;

        ctx.fillStyle = {
          core: "cyan",
          leaf: this.dna.type === "plant" ? "lime" : "yellowgreen",
          arm: this.dna.type === "plant" ? "orange" : "orangered"
        }[cell] || "gray";

        ctx.globalAlpha = 0.9;
        ctx.fillRect(px, py, cellSize - 1, cellSize - 1);
        ctx.globalAlpha = 1.0;
      }
    }
  }
}
