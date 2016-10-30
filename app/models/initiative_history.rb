class InitiativeHistory < ApplicationRecord

  belongs_to :game

  validates :game, presence: true
  validates :name, presence: true
  validates :use_count, presence: true
end
