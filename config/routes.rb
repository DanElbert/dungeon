Rails.application.routes.draw do

  resources :campaigns do
    get :initiative, on: :member
    resources :games, :only => [:new, :create]
    resources :drawing_images, controller: :images, only: %i(new create show update), type: 'DrawingImage'
    resources :token_images, controller: :images, only: %i(new create show update), type: 'TokenImage'
    resources :background_images, controller: :images, only: %i(new create show update), type: 'BackgroundImage'
  end

  get 'campaigns/:campaign_id/images', to: 'images#index', as: :campaign_images
  resources :images, only: %i(show edit update destroy)

  resources :copied_images, only: [:create], controller: 'images', type: 'CopiedImage'

  match '/admin' => 'admin/users#index', :via => :get

  namespace "admin" do
    resources :users
    resources :games, :except => [:new, :create]
    resources :campaigns, :except => [:new, :create]
    resources :background_images
  end

  resources :games, :only => [:show, :edit, :update, :destroy] do
    member do
      get 'get_game_data'
      get 'initiative'
      get 'game_tokens(/:game_id)' => :game_tokens
      #get 'initiative_names'
    end
  end

  resource :user, :except => [:show, :destroy] do
    resources :user_token_images, controller: :images, except: :index, type: 'UserTokenImage'
    get :forgot_password
    post :submit_forgot_password
    get :reset_password
    post :submit_reset_password
  end

  get 'user/user_token_images', to: 'images#user_index', as: :user_token_images

  match '/lobby' => 'campaigns#index', :via => :get, :as => :lobby

  match '/login' => 'users#login', :via => :get, :as => :login
  match '/login' => 'users#verify_login', :via => :post
  match '/logout' => 'users#logout', :via => :get, :as => :logout

  match '/about' => 'campaigns#about', via: :get, as: :about

  root :to => 'campaigns#index'
end
