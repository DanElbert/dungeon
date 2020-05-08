const poolSize = 250;
const pool = new Uint16Array(poolSize);
const poolIntMax = Math.pow(2, 16) - 1;
let poolIndex = poolSize;

function getPoolNumber() {
  if (poolIndex >= poolSize) {
    poolIndex = 0;
    window.crypto.getRandomValues(pool);
  }

  return pool[poolIndex++];
}

export function rollDie(sides) {
    if (sides > 100 || sides < 2) {
        throw `Invalid sides: ${sides}`;
    }

    const maxInt = poolIntMax - (poolIntMax % sides);

    while(true) {
        let r = getPoolNumber();
        if (r < maxInt) {
            return (r % sides) + 1;
        }
    }
}

window.__rollDie = rollDie;
