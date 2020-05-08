const intMax16 = Math.pow(2, 16) - 1;
const randomData16 = new Uint16Array(1);

function getRandomBits16() {
  window.crypto.getRandomValues(randomData16);
  return randomData16[0];
}

export function rollDie(sides) {
  if (sides > 100 || sides < 2) {
    throw `Invalid sides: ${sides}`;
  }

  const maxInt = intMax16 - (intMax16 % sides);

  while (true) {
    let r = getRandomBits16();
    if (r < maxInt) {
      return (r % sides) + 1;
    }
  }
}
