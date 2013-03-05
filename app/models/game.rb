class Game < ActiveRecord::Base

  STATUS = {:open => 'open', :active => 'active', :old => 'old'}

  attr_accessible :status, :name

  has_one :game_board, :dependent => :destroy

  validates :game_board, :presence => true
  validates :name, :presence => true


end
