class GamePolicy < ApplicationPolicy
  def show?
    authenticated? && record.is_pc?(user)
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