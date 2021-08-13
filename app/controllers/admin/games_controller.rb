module Admin
  class GamesController < AdminController

    def index
      @games = Game.includes(:campaign).joins(:campaign).order('campaigns.name, games.name').all

      respond_to do |format|
        format.html # index.html.erb
        format.json { render json: @games }
      end
    end

    def show
      @game = Game.find(params[:id])

      respond_to do |format|
        format.html # show.html.erb2
        format.json { render json: @game }
      end
    end

    def edit
      @game = Game.find(params[:id])
    end

    def update
      @game = Game.find(params[:id])

      respond_to do |format|
        if @game.update(game_params)
          format.html { redirect_to [:admin, @game], notice: 'Game was successfully updated.' }
          format.json { head :no_content }
        else
          format.html { render action: "edit" }
          format.json { render json: @game.errors, status: :unprocessable_entity }
        end
      end
    end

    def destroy
      @game = Game.find(params[:id])
      @game.destroy

      respond_to do |format|
        format.html { redirect_to admin_games_url, notice: 'Game Deleted' }
        format.json { head :no_content }
      end
    end

    private

    def game_params
      params.require(:game).permit(:name, :status, :campaign_id, {:board_attributes => [:background_image]})
    end
  end
end