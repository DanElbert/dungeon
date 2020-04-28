class CampaignPolicy < ApplicationPolicy

  def index?
    authenticated?
  end

  def show?
    pc_access
  end

  def create?
    authenticated?
  end

  def update?
    gm_access
  end

  def destroy?
    !record.nil? && record.user == user
  end

  def create_image?
    gm_access
  end

  def create_drawing_image?
    gm_access
  end

  def create_token_image?
    pc_access
  end

  def create_background_image?
    gm_access
  end

  private

  def gm_access
    authenticated? && !record.nil? && record.is_gm?(user)
  end

  def pc_access
    authenticated? && !record.nil? && record.is_pc?(user)
  end

  public

  class Scope < Scope
    def resolve
      scope.for_user(user)
    end
  end

end
