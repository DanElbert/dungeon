Dungeon::Application.routes.draw do

  namespace "admin" do
    resources :users
    resources :games, :except => [:new, :create]
  end

  resources :games, :only => [:new, :create, :show] do
    member do
      get 'get_game_board'
    end
  end

  match '/lobby' => 'lobby#index', :via => :get, :as => :lobby

  match '/login' => 'users#login', :via => :get, :as => :login
  match '/login' => 'users#verify_login', :via => :post
  match '/create_user' => 'users#create_user', :via => :get, :as => :create_user
  match '/create_user' => 'users#submit_user', :via => :post, :as => :submit_user
  match 'user/edit' => 'users#edit', :via => :get, :as => :edit_user
  match 'user/edit' => 'users#update', :via => :post

  root :to => 'users#login'
end
