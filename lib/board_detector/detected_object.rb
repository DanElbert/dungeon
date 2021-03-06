module BoardDetector
  class DetectedObject
    CELL_SIZE = 50.0

    attr_accessor :x, :y, :width, :height

    def initialize(x, y, width, height)
      self.x = x
      self.y = y
      self.width = width
      self.height = height
    end

    def row
      (self.y / CELL_SIZE).floor
    end

    def column
      (self.x / CELL_SIZE).floor
    end

    def tile_width
      [(self.width / CELL_SIZE).round, 1].max
    end

    def tile_height
      [(self.height / CELL_SIZE).round, 1].max
    end

    def as_json
      {
          x: column,
          y: row,
          height: tile_height,
          width: tile_width,
          raw_x: x,
          raw_y: y
      }
    end
  end
end