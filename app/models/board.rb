class Board < ApplicationRecord
  belongs_to :game
  belongs_to :background_image
  has_many :board_actions, -> { order(:created_at) }, :dependent => :destroy

  validates :grid_color, format: { with: /\Argba\((\s*\d+\s*,\s*){3}\d(\.\d+)?\s*\)|rgb\((\s*\d+\s*,\s*){2}\d+\s*\)\z/, message: 'must be in "rbg(r,g,b)" or "rgba(r,g,b,a)" format', allow_blank: true }

  def board_images
    [background_image].compact.map { |i| i.as_json }
  end

  def cell_size
    50
  end

  def actions
    board_actions.map { |a| a.as_json }
  end

  def to_param

  end

  def as_json(options={})
    {
        actions: actions,
        board_images: board_images,
        cell_size: cell_size,
        grid_color: grid_color,
        id: id,
        background_image: background_image.url
    }
  end

end
