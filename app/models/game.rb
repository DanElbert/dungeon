class Game < ActiveRecord::Base

  STATUS = {:open => 'open', :active => 'active', :old => 'old'}

  has_one :game_board, :dependent => :destroy
  has_many :initiatives, -> { order(:sort_order) }, :dependent => :destroy

  validates :game_board, :presence => true
  validates :name, :presence => true

  def board_json

  end

  def as_json(options = {})
    {
        :name => name,
        :status => status,
        :board => game_board.as_json,
        :initiative => initiatives.to_a.map { |i| {:name => i.name, :value => i.value} }
    }
  end

end
