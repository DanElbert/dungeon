Rails.application.routes.draw do

  resources :campaigns do
    resources :games, :only => [:new, :create]
    resources :drawing_images, controller: :images, only: %i(new create), type: 'CampaignImage'
    resources :token_images, controller: :images, only: %i(new create), type: 'TokenImage'
    resources :background_images, controller: :images, only: %i(new create), type: 'BackgroundImage'
  end

  get 'campaigns/:campaign_id/images', to: 'images#index', as: :images
  get '/images/:id(/:level/:tile).:format', to: 'images#show', constraints: { format: /\w+/ }, as: :image
  #resources :images, only: %i(edit update destroy)

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
      get 'initiative_names'
    end
  end

  resource :user, :except => [:show, :destroy]

  match '/lobby' => 'campaigns#index', :via => :get, :as => :lobby

  match '/login' => 'users#login', :via => :get, :as => :login
  match '/login' => 'users#verify_login', :via => :post
  match '/logout' => 'users#logout', :via => :get, :as => :logout

  match '/about' => 'campaigns#about', via: :get, as: :about

  root :to => 'campaigns#index'
end
