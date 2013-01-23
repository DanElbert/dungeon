class LobbyController < ApplicationController

  before_filter :ensure_valid_user

  def index
    user = current_user

    @active_games = Game.where(:status => Game::STATUS[:active])
    @open_games = Game.where(:status => Game::STATUS[:open])
    @old_games = Game.where(:status => Game::STATUS[:old])
  end
end