module Admin
  class CampaignsController < ApplicationController

    layout 'admin'
    before_filter :ensure_admin_user

    def index
      @campaigns = Campaign.all

      respond_to do |format|
        format.html
        format.json { render json: @campaigns }
      end
    end

    def show
      @campaign = Campaign.find(params[:id])

      respond_to do |format|
        format.html
        format.json { render json: @campaign }
      end
    end

    def edit
      @campaign = Campaign.find(params[:id])
    end

    def update
      @campaign = Campaign.find(params[:id])

      respond_to do |format|
        if @campaign.update_attributes(campaign_params)
          format.html { redirect_to [:admin, @campaign], notice: 'Campaign was successfully updated.' }
          format.json { head :no_content }
        else
          format.html { render action: "edit" }
          format.json { render json: @campaign.errors, status: :unprocessable_entity }
        end
      end
    end

    def destroy
      @campaign = Campaign.find(params[:id])

      respond_to do |format|
        if @campaign.destroy
          format.html { redirect_to admin_campaigns_url, notice: 'Campaign Deleted' }
          format.json { head :no_content }
        else
          flash[:error] = "Campaign Not Deleted:\n<br/>#{@campaign.errors.full_messages.join(', ')}"
          format.html { redirect_to admin_campaigns_url }
          format.json { render json: @campaign.errors, status: :unprocessable_entity }
        end
      end
    end

    private

    def campaign_params
      params.require(:campaign).permit(:name, :user_id)
    end
  end
end