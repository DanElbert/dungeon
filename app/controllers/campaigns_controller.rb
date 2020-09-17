class CampaignsController < ApplicationController
  after_action :verify_authorized, except: [:about]
  before_action :set_campaign, only: [:show, :edit, :update, :destroy]

  # GET /campaigns
  def index
    authorize Campaign
    @campaigns = policy_scope(Campaign).includes(:user).order(:name)
  end

  # GET /campaigns/1
  def show
  end

  # GET /campaigns/new
  def new
    authorize Campaign
    @campaign = Campaign.new
  end

  # GET /campaigns/1/edit
  def edit
  end

  # POST /campaigns
  def create
    authorize Campaign
    @campaign = Campaign.new(campaign_params)
    @campaign.user = current_user

    if @campaign.save
      redirect_to @campaign, notice: 'Campaign was successfully created.'
    else
      render action: 'new'
    end
  end

  # PATCH/PUT /campaigns/1
  def update
    if @campaign.update(campaign_params)
      redirect_to @campaign, notice: 'Campaign was successfully updated.'
    else
      render action: 'edit'
    end
  end

  # DELETE /campaigns/1
  def destroy
    @campaign.destroy
    redirect_to campaigns_url, notice: 'Campaign was successfully destroyed.'
  end

  def about
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_campaign
      @campaign = authorize Campaign.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def campaign_params
      params.require(:campaign).permit(:name, :use_x_letters, :requires_authorization, campaign_users_attributes: [:id, :user_id, :is_gm, :_destroy])
    end
end
