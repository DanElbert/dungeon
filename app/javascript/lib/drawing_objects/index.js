
import { BaseDrawing } from "./BaseDrawing";
import { BaseTemplate, BaseCellTemplate } from "./BaseTemplate";
import { DrawingCollection } from "./DrawingCollection";
import { ImageDrawing } from "./ImageDrawing";
import { OverlandMeasureTemplate } from "./OverlandTemplates";
import { PathfinderRectangleTemplate, PathfinderReachTemplate, PathfinderRadiusTemplate, PathfinderMovementTemplate, PathfinderLineTemplate, PathfinderConeTemplate} from "./PathfinderTemplates";
import { PenDrawing } from "./PenDrawing";
import { TiledImageDrawing } from "./TiledImageDrawing";
import { TokenDrawing } from "./TokenDrawing";

Object.assign(window, {
  BaseDrawing,
  BaseTemplate,
  BaseCellTemplate,
  DrawingCollection,
  ImageDrawing,
  OverlandMeasureTemplate,
  PathfinderConeTemplate,
  PathfinderLineTemplate,
  PathfinderMovementTemplate,
  PathfinderRadiusTemplate,
  PathfinderReachTemplate,
  PathfinderRectangleTemplate,
  PenDrawing,
  TiledImageDrawing,
  TokenDrawing
});

export {
  BaseDrawing,
  BaseTemplate,
  BaseCellTemplate,
  DrawingCollection,
  ImageDrawing,
  OverlandMeasureTemplate,
  PathfinderConeTemplate,
  PathfinderLineTemplate,
  PathfinderMovementTemplate,
  PathfinderRadiusTemplate,
  PathfinderReachTemplate,
  PathfinderRectangleTemplate,
  PenDrawing,
  TiledImageDrawing,
  TokenDrawing
};