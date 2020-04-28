class ImagesController < ApplicationController
  before_action :set_type, only: [:new, :create]
  before_action :set_campaign, only: [:new, :create, :index]
  before_action :set_image, only: [:show, :destroy]

  # GET /campaigns/1/images
  def index
    @drawing_images = @campaign.drawing_images.without_data
    @token_images = @campaign.token_images.without_data
    @background_images = @campaign.background_images.without_data
  end

  # GET /images/1
  def show
    if params[:format] == 'json'
      if @image.is_tiled
        return render json: @image.as_json
      else
        not_found
      end
    end

    not_found unless params[:format].to_s == @image.extension

    if params[:level].present? && !@image.is_tiled
      not_found
    end

    Rails.logger.warn "No processed image data found for #{@image.id}"
    head 420
  end

  # GET /images/new
  def new
    @image = type_class.new
  end

  # POST /images
  def create
    @image = type_class.new(image_params.merge(campaign: @campaign, status: Image::STATUS[:unprocessed], user: current_user))

    if params[:image] && params[:image][:data]
      @image.data = Base64.decode64(params[:image][:data])
      @image.filename = params[:image][:filename]
    elsif params[:image] && params[:image][:filename].is_a?(ActionDispatch::Http::UploadedFile)
      io = params[:image][:filename]
      @image.filename = io.original_filename
      @image.data = io.read
    end

    @image.calculate_size!

    respond_to do |format|
      if @image.save

        @image.process!

        format.html { redirect_to campaign_images_path(@campaign), notice: 'Image was successfully created.' }
        format.json { render json: @image, status: :created }
      else
        format.html { render action: "new" }
        format.json { render json: @image.errors, status: :unprocessable_entity }
      end
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
    if params[:campaign_id].present?
      @campaign = Campaign.find(params[:campaign_id])
      authorize(@campaign, "create_#{type_class.name.underscore}?")
    end
  end

  def type
    Image.types.include?(params[:type]) ? params[:type] : "Image"
  end

  def type_class
    type.constantize
  end

  def set_type
    @type = type
  end

  # Only allow a trusted parameter "white list" through.
  def image_params
    params.require(:image).permit(:name, :visible)
  end
end
