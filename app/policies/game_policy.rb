class GamePolicy < ApplicationPolicy
  def show?
    if [Game::STATUS[:active], Game::STATUS[:archived]].include?(record.status)
      authenticated? && record.is_pc?(user)
    else
      authenticated? && record.is_gm?(user)
    end
  end

  def get_game_data?
    show?
  end

  def initiative?
    show?
  end

  def initiative_names?
    show?
  end

  def update?
    authenticated? && record.is_gm?(user)
  end

  def destroy?
    authenticated? && record.is_gm?(user)
  end
end