class GameBoard < Board

  def self.from_template(template)
    b = GameBoard.new
    b.name = template.name
    template.board_pieces.each do |p|
      b.add_piece(p.left, p.top, p.right, p.bottom, p.image)
    end
    b
  end

end