class AdminPolicy < ApplicationPolicy

  def admin?
    administrator?
  end

end
