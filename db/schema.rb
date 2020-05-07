# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_05_07_031136) do

  create_table "board_actions", force: :cascade do |t|
    t.string "action_type"
    t.string "uid"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "board_id"
    t.json "properties"
    t.index ["board_id"], name: "index_board_actions_on_board_id"
    t.index ["created_at"], name: "index_board_actions_on_created_at"
    t.index ["uid"], name: "index_board_actions_on_uid"
  end

  create_table "board_detection_sessions", force: :cascade do |t|
    t.integer "game_id"
    t.integer "detect_width"
    t.integer "detect_height"
    t.integer "image_orientation"
    t.string "state"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "detect_origin_x"
    t.integer "detect_origin_y"
    t.integer "pattern_size"
    t.integer "pattern_dimension"
    t.binary "image", limit: 16777216
  end

  create_table "boards", force: :cascade do |t|
    t.integer "game_id"
    t.string "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "background_image_id"
    t.string "grid_color"
    t.integer "default_zoom"
    t.integer "cell_size_pixels"
    t.integer "cell_size_feet"
    t.string "template_type"
    t.integer "compass_rotation"
    t.index ["game_id"], name: "index_boards_on_game_id"
  end

  create_table "campaign_users", force: :cascade do |t|
    t.integer "campaign_id", null: false
    t.integer "user_id", null: false
    t.boolean "is_gm"
    t.index ["campaign_id"], name: "index_campaign_users_on_campaign_id"
    t.index ["user_id"], name: "index_campaign_users_on_user_id"
  end

  create_table "campaigns", force: :cascade do |t|
    t.string "name"
    t.integer "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean "use_x_letters"
    t.boolean "requires_authorization"
  end

  create_table "games", force: :cascade do |t|
    t.string "status"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "name"
    t.integer "user_id"
    t.integer "campaign_id"
    t.index ["campaign_id"], name: "index_games_on_campaign_id"
  end

  create_table "images", force: :cascade do |t|
    t.integer "campaign_id"
    t.string "filename"
    t.binary "data", limit: 16777216
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "type"
    t.string "name"
    t.boolean "is_tiled"
    t.integer "tile_size"
    t.integer "levels"
    t.string "status"
    t.integer "width"
    t.integer "height"
    t.integer "user_id"
    t.boolean "visible"
    t.boolean "is_deleted"
    t.index ["campaign_id"], name: "index_images_on_campaign_id"
    t.index ["type"], name: "index_images_on_type"
  end

  create_table "initiative_histories", force: :cascade do |t|
    t.string "name"
    t.integer "use_count"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "campaign_id"
    t.index ["name"], name: "index_initiative_histories_on_name"
  end

  create_table "initiatives", force: :cascade do |t|
    t.string "name"
    t.integer "value"
    t.integer "sort_order"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "bonus"
    t.integer "campaign_id"
    t.string "source"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "password_digest"
    t.boolean "is_admin"
    t.string "auth_token"
    t.string "username"
    t.string "ping_color"
    t.index ["email"], name: "index_users_on_email"
  end

end
