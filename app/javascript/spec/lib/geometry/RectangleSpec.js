import { Rectangle, Vector2 } from "../../../lib/geometry";

describe("Rectangle", () => {
  describe("centeredSquare", () => {

    it("returns the same geometry if already square", () => {
      let r = new Rectangle(new Vector2(0, 0), 10, 10);
      let s = r.centeredSquare();

      expect(s.left()).toEqual(0);
      expect(s.top()).toEqual(0);
      expect(s.width()).toEqual(10);
      expect(s.height()).toEqual(10);

      r = new Rectangle(new Vector2(15, 20), 10, 10);
      s = r.centeredSquare();

      expect(s.left()).toEqual(15);
      expect(s.top()).toEqual(20);
      expect(s.width()).toEqual(10);
      expect(s.height()).toEqual(10);
    });

    it("returns the correct square 1", () => {
      let r = new Rectangle(new Vector2(0, 0), 20, 10);
      let s = r.centeredSquare();

      expect(s.left()).toEqual(5);
      expect(s.top()).toEqual(0);
      expect(s.width()).toEqual(10);
      expect(s.height()).toEqual(10);
    });

    it("returns the correct square 2", () => {
      let r = new Rectangle(new Vector2(15, -10), 12, 30);
      let s = r.centeredSquare();

      expect(s.left()).toEqual(15);
      expect(s.top()).toEqual(-1);
      expect(s.width()).toEqual(12);
      expect(s.height()).toEqual(12);
    });

  });
});