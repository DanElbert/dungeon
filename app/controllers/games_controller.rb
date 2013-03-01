class GamesController < ApplicationController

  before_filter :ensure_valid_user

  def show
    @game = Game.find(params[:id])

    render :layout => "game_board"
  end

  def get_game_board
    game = Game.includes(:game_board => [:board_pieces, :board_drawing_actions]).find(params[:id])
    @board = game.game_board
    render :json => @board
  end

  def new
    @game = Game.new
  end

  def create
    @game = Game.new(params[:game])

    @template = TemplateBoard.find(params[:board_template])
    @game.game_board = GameBoard.from_template(@template)

      if @game.save
        redirect_to @game, notice: 'Game was successfully created.'
      else
        render action: "new"
      end
  end

end