import { MultiLevelDrawingLayer } from "../../../lib/board/MultiLevelDrawingLayer";

function checkLevels(data, expectedIds, activeIdx) {
  expect(data.length).withContext("Incorrect level count").toEqual(expectedIds.length);
  for (let x = 0; x < data.length; x++) {
    expect(data[x].id).withContext(`Incorrect level at idx ${x}`).toEqual(expectedIds[x]);
  }
  expect(data[activeIdx].isActive).withContext("Incorrect active level").toEqual(true);
}

describe("MultiLevelDrawingLayer", function() {

  beforeEach(function() {
    this.drawingSettings = {};
    this.drawingLayer = new MultiLevelDrawingLayer(this.drawingSettings);
  });

  it("initializes correctly", function() {
    const levels = this.drawingLayer.getLevelData();
    checkLevels(levels, ["0001"], 0);
  });

  it("can add levels", function() {
    const levels = this.drawingLayer.getLevelData();

    this.drawingLayer.addLevel("0002", "Level 2");
    checkLevels(levels, ["0001", "0002"], 0);

    this.drawingLayer.addLevel("0003", "Level 3");
    checkLevels(levels, ["0001", "0002", "0003"], 0);
  });

  describe("removing levels", function() {
    beforeEach(function() {
      this.drawingLayer.addLevel("0002", "Level 2");
      this.drawingLayer.addLevel("0003", "Level 3");
    });

    it("removes the first level", function() {
      const levels = this.drawingLayer.getLevelData();

      this.drawingLayer.removeLevel("0001");

      checkLevels(levels, ["0002", "0003"], 0);
    });

    it("removes the last level", function() {
      const levels = this.drawingLayer.getLevelData();

      this.drawingLayer.setLevel("0003");
      this.drawingLayer.removeLevel("0003");

      checkLevels(levels, ["0001", "0002"], 1);
    });

    it("removes an active middle level", function() {
      const levels = this.drawingLayer.getLevelData();

      this.drawingLayer.setLevel("0002");
      this.drawingLayer.removeLevel("0002");

      checkLevels(levels, ["0001", "0003"], 1);
    });

    it("removes an inactive middle level", function() {
      const levels = this.drawingLayer.getLevelData();

      this.drawingLayer.setLevel("0003");
      this.drawingLayer.removeLevel("0002");

      checkLevels(levels, ["0001", "0003"], 1);
    });

    it("does not remove the last level", function() {
      this.drawingLayer.removeLevel("0003");
      this.drawingLayer.removeLevel("0002");
      this.drawingLayer.removeLevel("0001");

      const levels = this.drawingLayer.getLevelData();
      checkLevels(levels, ["0001"], 0);
    });
  });

  describe("Moving a level", function() {

    beforeEach(function() {
      this.drawingLayer.addLevel("0002", "Level 2");
      this.drawingLayer.addLevel("0003", "Level 3");
    });

    it("moves the active level up", function() {
      const levels = this.drawingLayer.getLevelData();

      this.drawingLayer.updateLevel("0001", 1, "Level 1");
      checkLevels(levels, ["0002", "0001", "0003"], 1);
    });

    it("moves the active level down", function() {
      const levels = this.drawingLayer.getLevelData();

      this.drawingLayer.setLevel("0002");
      this.drawingLayer.updateLevel("0002", 0, "Level 2");
      checkLevels(levels, ["0002", "0001", "0003"], 0);
    });

  });

});