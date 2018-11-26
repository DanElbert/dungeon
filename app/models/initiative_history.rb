class InitiativeHistory < ApplicationRecord

  belongs_to :game, :inverse_of => :initiative_histories

  validates :game, presence: true
  validates :use_count, presence: true
end
