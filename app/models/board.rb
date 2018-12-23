class Board < ApplicationRecord

  TEMPLATE_TYPES = {
      pathfinder: 'Pathfinder',
      overland: 'Overland'
  }

  belongs_to :game
  belongs_to :background_image
  has_many :board_actions, -> { order(:created_at) }, :dependent => :destroy

  validates :grid_color, format: { with: /\Argba\((\s*\d+\s*,\s*){3}\d(\.\d+)?\s*\)|rgb\((\s*\d+\s*,\s*){2}\d+\s*\)\z/, message: 'must be in "rbg(r,g,b)" or "rgba(r,g,b,a)" format', allow_blank: true }
  validates :cell_size_pixels, numericality: { only_integer: true, greater_than_or_equal_to: 25, less_than_or_equal_to: 250, allow_blank: true }
  validates :cell_size_feet, numericality: { only_integer: true, greater_than_or_equal_to: 3, less_than_or_equal_to: 52800, allow_blank: true }
  validates :default_zoom, numericality: { only_integer: true, greater_than_or_equal_to: 10, less_than_or_equal_to: 250, allow_blank: true }
  validates :template_type, inclusion: { in: TEMPLATE_TYPES.keys.map(&:to_s), allow_blank: true }
  validate :template_type_cell_size

  def board_images
    [background_image].compact.map { |i| i.as_json }
  end

  def actions
    board_actions.map { |a| a.as_json }
  end

  def template_type_cell_size
    if self.cell_size_feet != 5 && self.template_type == 'pathfinder'
      errors.add(:template_type, "pathfinder templates only work with 5' cells")
    end
  end

  def to_param

  end

  def as_json(options={})
    {
        actions: actions,
        board_images: board_images,
        cell_size: cell_size_pixels.present? ? cell_size_pixels : 50,
        cell_size_pixels: cell_size_pixels.present? ? cell_size_pixels : 50,
        cell_size_feet: cell_size_feet.present? ? cell_size_feet : 5,
        default_zoom: default_zoom.present? ? default_zoom : 100,
        template_type: template_type.present? ? template_type : 'pathfinder',
        grid_color: grid_color,
        id: id,
        background_image: background_image.as_json
    }
  end

end
