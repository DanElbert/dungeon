class GameBoard < Board

  def create_default_drawing
    raise "Drawing already exists" unless board_drawing.nil?

    size = board_size
    data = Images.build_blank_png(size[0], size[1])

    drawing = BoardDrawing.new
    drawing.set_data(data)
    self.board_drawing = drawing
  end

  def self.from_template(template)
    b = GameBoard.new
    b.name = template.name
    template.board_pieces.each do |p|
      b.add_piece(p.left, p.top, p.right, p.bottom, p.image)
    end
    b
  end

end