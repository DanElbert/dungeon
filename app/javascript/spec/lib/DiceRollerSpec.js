import { rollDie } from "../../lib/DiceRoller";

describe("DiceRoller", () => {
  describe("rollDie()", () => {
    it("rolls a d20 evenly across many rolls", () => {
      const sides = 20;
      const rollCount = 1000000;
      const results = new Array(sides);
      results.fill(0);

      for (let x = 0; x < rollCount; x++) {
        results[rollDie(sides) - 1]++;
      }

      for (let x = 0; x < sides; x++) {
        let ratio = results[x] / rollCount;
        expect(ratio).toBeCloseTo(1.0 / sides);
      }
    });
  });
});