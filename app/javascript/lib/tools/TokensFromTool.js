import { Tool } from "./Tool";
import { generateActionId } from "../Actions";
import { TokenDrawing } from "../drawing_objects";
import {Geometry, Vector2} from "../geometry";

export class TokensFromTool extends Tool {
  constructor(manager) {
    super(manager);
    
    this.gameTokens = null;
    this.placementStart = [0, 0];
    this.tokens = [];
  }

  buildOptions() {
    this.options.add({type: "gameTokens", label: "Game", name: "game", gameId: this.board.gameId, value: null});
  }

  optionsChanged() {
    const optGameTokens = this.options.get("game").value;
    if (this.gameTokens !== optGameTokens) {
      this.gameTokens = optGameTokens;
      this.rebuildTokens();
    }
  }

  enable() {
    board.event_manager.on('click.TokensFromTool', mapEvt => {
      this.updateCursor(mapEvt.mapPointCell);
      this.saveAction();
    });
    
    board.event_manager.on('mousemove.TokensFromTool', mapEvt => {
      this.updateCursor(mapEvt.mapPointCell);
    });
  }

  disable() {
    this.board.event_manager.off(".TokensFromTool");
    this.gameTokens = null;
    this.rebuildTokens();
  }
  
  updateCursor(cell) {
    this.placementStart = [cell[0] * this.board.drawingSettings.cellSize, cell[1] * this.board.drawingSettings.cellSize];
    this.updatePosition();
  }
  
  updatePosition() {
    const cellSize = this.board.drawingSettings.cellSize;
    const max_cols = 7
    let x = 0, y = 0, curRowHeight = 0;
    
    for (let token of this.tokens) {
      token.updateProperties({
        position: new Vector2(
          this.placementStart[0] + (cellSize * x),
          this.placementStart[1] + (cellSize * y)
        )
      });
      
      x += token.tokenCellSize;
      curRowHeight = Math.max(curRowHeight, token.tokenCellSize);
      
      if (x >= max_cols) {
        y += curRowHeight;
        x = 0;
        curRowHeight = 0;
      }
    }
  }

  rebuildTokens() {
    if (this.tokens) {
      for (let t of this.tokens) {
        this.board.tokenLayer.removeToken(t.uid);
      }
    }
    this.tokens = [];
    
    if (this.gameTokens && this.gameTokens.tokens) {
      for (let tokenData of this.gameTokens.tokens) {

        const token = new TokenDrawing(generateActionId(), this.board, new Vector2(0, 0),
          tokenData.tokenCellSize || tokenData.width,
          tokenData.color,
          tokenData.fontColor,
          tokenData.fontSize,
          tokenData.text,
          tokenData.imageUrl,
          tokenData.totalHp,
          tokenData.currentHp,
          tokenData.icons);

        this.tokens.push(token);
        this.board.tokenLayer.addToken(token);
      }
    }
    
    this.updatePosition();
  }

  draw() {
    
  }
  
  saveAction() {
    if (!this.tokens || this.tokens.length === 0) {
      return;
    }
    
    const createAction = {
      uid: generateActionId(),
      actionType: "compositeAction",
      actionList: this.tokens.map(token => token.toAction())
    };

    const undoAction = {
      uid: generateActionId(),
      actionType: "compositeAction",
      actionList: this.tokens.map(token => {
        return {
          uid: generateActionId(),
          actionType: "removeTokenAction",
          actionId: token.uid
        };
      })
    };

    this.options.get("game").value = null;

    this.board.addAction(createAction, undoAction, true);
  }
}