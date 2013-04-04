class GamesController < ApplicationController

  before_filter :ensure_valid_user

  def show
    @game = Game.find(params[:id])

    render :layout => "game_board"
  end

  def get_game_data
    @game = Game.includes(:initiatives, {:game_board => [:board_pieces, :board_drawing_actions]}).find(params[:id])
    render :json => @game
  end

  def new
    @game = Game.new
  end

  def create
    @game = Game.new(game_params)

    @template = TemplateBoard.find(params[:board_template])
    @game.game_board = GameBoard.from_template(@template)

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