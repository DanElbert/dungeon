class GamesController < ApplicationController
  after_action :verify_authorized
  before_action :set_game, except: [:new, :create]
  before_action :set_campaign, only: [:new, :create]

  def show
    render :layout => "game_board"
  end

  def get_game_data
    render :json => @game.as_json(:current_user_id => current_user.id)
  end

  def new
    @game = Game.new
    @game.campaign = @campaign
    @game.board = Board.new
  end

  def create
    @game = Game.new(game_params)
    @game.campaign = @campaign

    if @game.save
      CampaignChannel.update_campaign(@game.campaign)
      redirect_to @game, notice: 'Game was successfully created.'
    else
      render action: "new"
    end
  end

  def edit
  end

  def update
    respond_to do |format|
      if @game.update(game_params)
        CampaignChannel.update_campaign(@game.campaign)
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
    CampaignChannel.update_campaign(@game.campaign)
    flash[:notice] = 'Game deleted'
    redirect_to campaign_path(@game.campaign)
  end

  def initiative
    campaign = @game.campaign
    @initiative_json = {
      'initiative' => campaign.initiatives.as_json,
      'initiative_names' => campaign.initiative_history_names
    }.to_json
  end

  def game_tokens
    if params[:game_id]
      @other_game = Game.find(params[:game_id])

      tokens = {}

      BoardAction.where(board_id: @other_game.board.id, action_type: %w(updateTokenAction addTokenAction)).order(:created_at).each do |a|
        case a.action_type
          when 'addTokenAction'
            tokens[a.uid] = a.as_json.except('isPersistent', 'isRemoval', 'action', 'actionId', 'actionType', 'uid')
          when 'updateTokenAction'
            if (t = tokens[a.actionId])
              t.merge!(a.properties.except('isPersistent', 'isRemoval', 'action', 'actionId', 'actionType', 'uid'))
            end
        end
      end

      render json: tokens.values.to_json

    else
      @games = @game.campaign.games.where("id <> ? AND status <> ?", @game.id, Game::STATUS[:deleted]).order(:name)
      render json: @games.map { |g| { id: g.id, name: g.name, status: g.status } }.to_json
    end
  end

  # def initiative_names
  #   histories = InitiativeHistory.where(game: @game).order(use_count: :desc).limit(10)
  #   init_names = Initiative.where(game: @game).select(:name).group(:name).pluck(:name)
  #
  #   if init_names.length > 0
  #     histories = histories.where('name NOT IN (?)', init_names)
  #   end
  #
  #   if params[:term].present?
  #     histories = histories.where('name LIKE ?', "#{params[:term]}%")
  #   end
  #
  #   render json: histories.map { |h| h.name }
  # end

  private

  def set_game
    @game = authorize Game.find(params[:id])
  end

  def set_campaign
    @campaign = authorize(Campaign.find(params[:campaign_id]), :update?)
  end

  def game_params
    params.require(:game).permit(:name, :status, {:board_attributes => [:background_image_id, :grid_color, :cell_size_pixels, :cell_size_feet, :default_zoom, :default_coordinates_x, :default_coordinates_y, :template_type, :compass_rotation ]})
  end

end
