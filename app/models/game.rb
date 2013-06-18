class Game < ActiveRecord::Base

  STATUS = {:open => 'open', :active => 'active', :old => 'old'}

  has_one :board, :dependent => :destroy
  has_many :initiatives, -> { order(:sort_order) }, :dependent => :destroy

  validates :board, :presence => true
  validates :name, :presence => true

  def board_json

  end

  def as_json(options = {})
    {
        :name => name,
        :status => status,
        :board => board.as_json(options.slice(:image_callback)),
        :initiative => initiatives.to_a.map { |i| {:name => i.name, :value => i.value} }
    }
  end

end
