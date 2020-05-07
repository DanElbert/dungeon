class InitiativeHistory < ApplicationRecord

  belongs_to :campaign, :inverse_of => :initiative_histories

  validates :campaign, presence: true
  validates :use_count, presence: true

  def normalized_name
    self.name.downcase
  end

end
