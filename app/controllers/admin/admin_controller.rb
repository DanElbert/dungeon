module Admin
  class AdminController < ApplicationController

    before_action :ensure_admin_user

    def ensure_admin_user
      authorize(:admin, :admin?)
    end

  end
end