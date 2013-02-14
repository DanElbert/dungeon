class GamesController < ApplicationController

  before_filter :ensure_valid_user

  def show
    @game = Game.find(params[:id])
  end

  def get_game_board
    game = Game.includes(:game_board => :board_pieces).find(params[:id])
    @board = game.game_board
    render :json => @board
  end

  def drawing
    game = Game.includes(:game_board => {:board_drawing => :board_drawing_data}).find(params[:id])

    unless game.game_board.board_drawing
      game.game_board.create_default_drawing
    end

    data = game.game_board.board_drawing.board_drawing_data.data

    send_data data, :filename => 'drawing.png', :type => 'image/png', :disposition => 'inline'
  end

  def update_drawing
    game = Game.includes(:game_board => :board_drawing).find(params[:id])

    puts params[:drawing_version]

    if game.game_board.drawing_version == params[:drawing_version].to_i
      data = params[:drawing_data]
      data = data["data:image/png;base64,".length..-1]
      data = Base64.decode64(data)
      game.game_board.board_drawing.set_data(data)
      game.game_board.board_drawing.board_drawing_data.save
      game.game_board.board_drawing.save
      render :json => {:success => true, :version => game.game_board.drawing_version}
    else
      render :json => {:success => false}
    end

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