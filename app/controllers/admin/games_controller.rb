module Admin
  class GamesController < ApplicationController

    layout 'admin'
    before_filter :ensure_admin_user

    # GET /games
    # GET /games.json
    def index
      @games = Game.all

      respond_to do |format|
        format.html # index.html.erb
        format.json { render json: @games }
      end
    end

    # GET /games/1
    # GET /games/1.json
    def show
      @game = Game.find(params[:id])

      respond_to do |format|
        format.html # show.html.erb2
        format.json { render json: @game }
      end
    end

    # GET /games/1/edit
    def edit
      @game = Game.find(params[:id])
    end

    # PUT /games/1
    # PUT /games/1.json
    def update
      @game = Game.find(params[:id])

      respond_to do |format|
        if @game.update_attributes(params[:game])
          format.html { redirect_to [:admin, @game], notice: 'Game was successfully updated.' }
          format.json { head :no_content }
        else
          format.html { render action: "edit" }
          format.json { render json: @game.errors, status: :unprocessable_entity }
        end
      end
    end

    # DELETE /games/1
    # DELETE /games/1.json
    def destroy
      @game = Game.find(params[:id])
      @game.destroy

      respond_to do |format|
        format.html { redirect_to admin_games_url }
        format.json { head :no_content }
      end
    end
  end
end