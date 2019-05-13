import Api from "../Api";
import { Board } from "./Board";

function calculatePixelRatio() {
  const ctx = document.createElement("canvas").getContext("2d"),
    dpr = window.devicePixelRatio || 1,
    bsr = ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1;

  return dpr / bsr;
}

export class GameBoard {
  constructor(gameId, element) {
    this.gameId = gameId;
    this.wrapper = element;
    this.pixelRatio = calculatePixelRatio();
    this.board = new Board(element, this.gameId);
    this.data = null;
  }

  start() {
    window.addEventListener('resize', e => {
      if (e.target === window) {
        this.setCanvasSize();
      }
    });

    this.setCanvasSize();
    this.refreshBoard().then(() => this.drawGame());
  }

  setCanvasSize() {
    // Set game board size
    //var b = document.getElementById("game_board_container");
    const width = Math.floor(window.innerWidth);
    const height = Math.floor(window.innerHeight);
    this.board.setCanvasSize(width, height, this.pixelRatio);
  }

  drawGame() {
    this.board.update();
    window.requestAnimationFrame(() => this.drawGame());
  }

  setSize(zoom) {
    this.board.setZoom(parseFloat(zoom));
  }

  refreshBoard() {
    return Api.getJson(`/games/${this.gameId}/get_game_data`).then(data => {
      this.data = data;
      this.setSize(1.0);
      this.board.refresh(data);
    });
  }
}


window.CAMPAIGN_ID = 'OVERRIDE THIS IN VIEW';
window.GameBoard = GameBoard;