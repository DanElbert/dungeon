# Describes a board detection session
# note that pattern_size is the number of squares in 1 dimension (so a 4x4 chessboard would have a pattern_size of 4)
# pattern_dimension is the total length in pixels of 1 side of the full pattern.
class BoardDetectionSession < ApplicationRecord

  belongs_to :game

  VALID_STATES = {
      initialized: 'initialized',
      capturing: 'capturing',
      failed: 'failed',
      finished: 'finished'
  }

  scope :current, -> { where(state: [VALID_STATES[:initialized], VALID_STATES[:capturing]]) }

  def fail!
    self.state = VALID_STATES[:failed]
    self.save!
  end

  def finish!
    self.state = VALID_STATES[:finished]
    self.save!
  end
end
