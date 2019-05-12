class GamesController < ApplicationController
  after_action :verify_authorized
  before_action :set_game, except: [:new, :create]
  before_action :set_campaign, only: [:new, :create]

  def show
    render :layout => "game_board"
  end

  def get_game_data
    render :json => Oj.dump(@game.as_json(:current_user_id => current_user.id))
  end

  def new
    @game = Game.new
    @game.campaign = @campaign
    @game.board = Board.new(default_zoom: 100, cell_size_pixels: 50, cell_size_feet: 5)
  end

  def create
    @game = Game.new(game_params)
    @game.campaign = @campaign

    if @game.save
      redirect_to @game, notice: 'Game was successfully created.'
    else
      render action: "new"
    end
  end

  def edit
  end

  def update
    respond_to do |format|
      if @game.update_attributes(game_params)
        format.html { redirect_to campaign_path(@game.campaign), notice: 'Game was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @game.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @game.status = Game::STATUS[:deleted]
    @game.save!
    flash[:notice] = 'Game deleted'
    redirect_to campaign_path(@game.campaign)
  end

  def initiative
    game_json = @game.as_json

    @initiative_json = {
        initiative: game_json[:initiative],
        initiative_names: game_json[:initiative_names]
    }.to_json
  end

  def initiative_names
    histories = InitiativeHistory.where(game: @game).order(use_count: :desc).limit(10)
    init_names = Initiative.where(game: @game).select(:name).group(:name).pluck(:name)

    if init_names.length > 0
      histories = histories.where('name NOT IN (?)', init_names)
    end

    if params[:term].present?
      histories = histories.where('name LIKE ?', "#{params[:term]}%")
    end

    render json: histories.map { |h| h.name }
  end

  private

  def set_game
    @game = authorize Game.find(params[:id])
  end

  def set_campaign
    @campaign = authorize(Campaign.find(params[:campaign_id]), :update?)
  end

  def game_params
    params.require(:game).permit(:name, :status, {:board_attributes => [:background_image_id, :grid_color, :cell_size_pixels, :cell_size_feet, :default_zoom, :template_type]})
  end

end