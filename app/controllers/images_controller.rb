class ImagesController < ApplicationController
  before_action :set_image, only: [:show, :destroy]
  before_action :set_campaign, only: [:create]
  before_action :set_type, only: [:new, :create]

  # GET /images/1
  def show
    not_found unless params[:format].to_s == @image.extension
    FileUtils.mkdir_p Rails.root.join('public', 'images')
    File.binwrite(Rails.root.join('public', 'images', "#{@image.id}.#{@image.extension}").to_s, @image.data)
    send_data @image.data, filename: @image.filename, disposition: 'inline'
  end

  # GET /images/new
  def new
    @image = type_class.new
  end

  # POST /images
  def create
    if params[:image] && params[:image][:data]
      params[:image][:data] = Base64.decode64(params[:image][:data])
    end
    @image = type_class.new(image_params)
    @image.campaign = @campaign

    respond_to do |format|
      if @image.save
        format.html { redirect_to image_page(@image), notice: 'Image was successfully created.' }
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
    @campaign = Campaign.where(id: params[:campaign_id]).first
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
    params.require(:image).permit(:filename, :data)
  end
end
