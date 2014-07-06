class Board < ActiveRecord::Base
  belongs_to :game
  belongs_to :background_image
  has_many :board_actions, -> { order(:created_at) }, :dependent => :destroy

  def board_images
    [background_image].compact.map { |i| i.as_json }
  end

  def cell_size
    50
  end

  def actions
    board_actions.map { |a| a.as_json }
  end

  def as_json(options={})
    {
        actions: actions,
        board_images: board_images,
        cell_size: cell_size,
        id: id,
        background_image: background_image.filename
    }
  end

end
