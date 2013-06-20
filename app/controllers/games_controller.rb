class GamesController < ApplicationController

  before_filter :ensure_valid_user

  def show
    @game = Game.find(params[:id])

    render :layout => "game_board"
  end

  def get_game_data
    @game = Game.includes(:initiatives, {:board => :board_actions}).find(params[:id])
    image_proc = Proc.new do |path|
      ActionController::Base.helpers.asset_path(path)
    end
    render :json => @game.to_json(:image_callback => image_proc)
  end

  def new
    @game = Game.new
  end

  def create
    @game = Game.new(game_params)
    @game.board = Board.new
    @game.board.background_image = params[:background_image]

    if @game.save
      redirect_to @game, notice: 'Game was successfully created.'
    else
      render action: "new"
    end
  end

  private

  def game_params
    params.require(:game).permit(:name, :status)
  end

end