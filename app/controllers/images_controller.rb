class ImagesController < ApplicationController
  before_action :set_user
  before_action :set_type, only: [:new, :create]
  before_action :set_campaign, only: [:new, :create, :index]
  before_action :set_image, only: [:show, :edit, :update, :destroy]

  # GET /campaigns/1/images
  def index
    @drawing_images = @campaign.drawing_images.active.without_data
    @token_images = @campaign.token_images.active.without_data
    @background_images = @campaign.background_images.active.without_data
  end

  def user_index
    @user_token_images = UserTokenImage.for_user(current_user.id).without_data
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

        format.html { redirect_to index_location, notice: 'Image was successfully created.' }
        format.json { render json: @image, status: :created }
      else
        format.html { render action: "new" }
        format.json { render json: @image.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
    @campaign = @image.campaign
  end

  def update
    if @image.update_attributes(image_params)
      redirect_to index_location, notice: 'Game was successfully updated.'
    else
      render action: 'edit'
    end
  end

  # DELETE /images/1
  def destroy
    params[:type] = @image.type
    @image.update_attribute(:is_deleted, true)
    url = index_location
    redirect_to url, notice: 'Image was successfully destroyed.'
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

  def index_location
    case self.type
      when 'UserTokenImage'
        user_token_images_path
      else
        campaign_images_path(@campaign)
    end
  end

  def type_class
    type.constantize
  end

  def set_type
    @type = type
  end

  def set_user
    @user = current_user
  end

  # Only allow a trusted parameter "white list" through.
  def image_params
    params.require(:image).permit(:name, :visible, :filename, :data)
  end
end
