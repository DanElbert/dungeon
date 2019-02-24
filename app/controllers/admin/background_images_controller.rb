module Admin
  class BackgroundImagesController < AdminController

    before_action :set_background_image, only: [:show, :destroy]

    def index
      @background_images = BackgroundImage.all
    end

    def show
    end

    def new
      @background_image = BackgroundImage.new
    end

    def create
      @background_image = BackgroundImage.new

      if params[:background_image].present? && params[:background_image][:filename].present?
        io = params[:background_image][:filename]
        @background_image.filename = io.original_filename
        @background_image.data = io.read

        @background_image.save!

        redirect_to admin_background_images_path
      else
        render :new
      end

    end

    def destroy
      if @background_image.games.count > 0
        flash[:warning] = 'Image attached to games'
        redirect_to admin_background_images_path
      else
        @background_image.destroy
        redirect_to admin_background_images_path, notice: 'Image destroyed'
      end
    end

    private

    def set_background_image
      @background_image = BackgroundImage.find(params[:id])
    end
  end
end