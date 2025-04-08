import { rand } from './utils.js';

export function generateDNA(parentDNA = null) {
  if (parentDNA) {
    return {
      shape: parentDNA.shape,
      colorHue: (parentDNA.colorHue + rand(-10, 10)) % 360,
      behavior: parentDNA.behavior,
      traits: {
        size: Math.max(6, parentDNA.traits.size + rand(-1, 1)),
        speed: Math.max(0.5, parentDNA.traits.speed + rand(-0.1, 0.1)),
      }
    };
  } else {
    return {
      shape: ["worm", "fish", "jelly"][Math.floor(rand(0, 3))],
      colorHue: rand(180, 320),
      behavior: "wander",
      traits: {
        size: rand(10, 20),
        speed: rand(0.5, 1.5)
      }
    };
  }
}
