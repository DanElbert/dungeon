# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20131209002748) do

  create_table "board_actions", force: true do |t|
    t.string   "action_type"
    t.string   "uid"
    t.text     "properties"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "board_id"
  end

  create_table "board_detection_sessions", force: true do |t|
    t.integer  "game_id"
    t.integer  "detect_width"
    t.integer  "detect_height"
    t.integer  "image_orientation"
    t.string   "state"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "detect_origin_x"
    t.integer  "detect_origin_y"
    t.integer  "pattern_size"
    t.integer  "pattern_dimension"
    t.binary   "image",             limit: 16777216
  end

  create_table "boards", force: true do |t|
    t.integer  "game_id"
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "background_image"
  end

  create_table "games", force: true do |t|
    t.string   "status"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name"
    t.integer  "user_id"
  end

  create_table "initiative_histories", force: true do |t|
    t.integer  "game_id"
    t.string   "name"
    t.integer  "use_count"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "initiative_histories", ["game_id"], name: "index_initiative_histories_on_game_id"
  add_index "initiative_histories", ["name"], name: "index_initiative_histories_on_name"

  create_table "initiatives", force: true do |t|
    t.integer  "game_id"
    t.string   "name"
    t.integer  "value"
    t.integer  "sort_order"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", force: true do |t|
    t.string   "email"
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "password_digest"
    t.boolean  "is_admin"
    t.string   "auth_token"
  end

end
