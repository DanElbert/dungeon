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
    render :json => @game.to_json(:image_callback => image_proc, :current_user_id => current_user.id)
  end

  def new
    @game = Game.new
    @game.board = Board.new
    @game.campaign_id = params[:campaign_id] if params[:campaign_id]
  end

  def create
    @game = Game.new(game_params)
    @game.user = current_user

    if @game.save
      redirect_to @game, notice: 'Game was successfully created.'
    else
      render action: "new"
    end
  end

  def edit
    @game = Game.find(params[:id])
  end

  def update
    @game = Game.find(params[:id])

    respond_to do |format|
      if @game.update_attributes(game_params)
        format.html { redirect_to lobby_path, notice: 'Game was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @game.errors, status: :unprocessable_entity }
      end
    end
  end

  def initiative
    @game = Game.includes(:initiatives).find(params[:id])
    @initiative_json = @game.as_json[:initiative].to_json
  end

  def initiative_names
    histories = InitiativeHistory.where(game_id: params[:id]).order(use_count: :desc).limit(10)
    init_names = Initiative.where(game_id: params[:id]).select(:name).group(:name).pluck(:name)

    if init_names.length > 0
      histories = histories.where('name NOT IN (?)', init_names)
    end

    if params[:term].present?
      histories = histories.where('name LIKE ?', "#{params[:term]}%")
    end

    render json: histories.map { |h| h.name }
  end

  private

  def game_params
    params.require(:game).permit(:name, :status, {:board_attributes => [:background_image]})
  end

end