class ImagesController < ApplicationController
  before_action :set_image, only: [:show, :destroy]
  before_action :set_campaign, only: [:create]

  # GET /images/1
  def show
    FileUtils.mkdir_p Rails.root.join('public', 'images')
    File.binwrite(Rails.root.join('public', 'images', @image.id.to_s).to_s, @image.data)
    send_data @image.data, filename: @image.filename, disposition: 'inline'
  end

  # GET /images/new
  def new
    @image = Image.new
  end

  # POST /images
  def create
    @image = Image.new(image_params)
    @image.campaign = @campaign

    if @image.save
      redirect_to @image, notice: 'Image was successfully created.'
    else
      render action: 'new'
    end
  end

  # DELETE /images/1
  def destroy
    @image.destroy
    redirect_to images_url, notice: 'Image was successfully destroyed.'
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_image
    @image = Image.find(params[:id])
  end

  def set_campaign
    @campaign = Campaign.find(params[:campaign_id])
  end

  # Only allow a trusted parameter "white list" through.
  def image_params
    params.require(:image).permit(:filename, :data)
  end
end
