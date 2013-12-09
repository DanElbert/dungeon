Dungeon::Application.routes.draw do

  resources :campaigns

  match '/admin' => 'admin/users#index', :via => :get

  namespace "admin" do
    resources :users
    resources :games, :except => [:new, :create]
  end

  resources :games, :only => [:new, :create, :show, :edit, :update] do
    member do
      get 'get_game_data'
      get 'initiative'
      get 'initiative_names'
    end
  end

  match '/lobby' => 'lobby#index', :via => :get, :as => :lobby

  match '/login' => 'users#login', :via => :get, :as => :login
  match '/login' => 'users#verify_login', :via => :post
  match '/logout' => 'users#logout', :via => :get, :as => :logout
  match '/create_user' => 'users#create_user', :via => :get, :as => :create_user
  match '/create_user' => 'users#submit_user', :via => :post, :as => :submit_user
  match 'user/edit' => 'users#edit', :via => :get, :as => :edit_user
  match 'user/edit' => 'users#update', :via => :post

  root :to => 'lobby#index'
end
