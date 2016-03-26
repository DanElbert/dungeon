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

ActiveRecord::Schema.define(version: 20160311174557) do

  create_table "board_actions", force: :cascade do |t|
    t.string   "action_type", limit: 255
    t.string   "uid",         limit: 255
    t.text     "properties"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.integer  "board_id"
  end

  create_table "board_detection_sessions", force: :cascade do |t|
    t.integer  "game_id"
    t.integer  "detect_width"
    t.integer  "detect_height"
    t.integer  "image_orientation"
    t.string   "state",             limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "detect_origin_x"
    t.integer  "detect_origin_y"
    t.integer  "pattern_size"
    t.integer  "pattern_dimension"
    t.binary   "image"
  end

  create_table "boards", force: :cascade do |t|
    t.integer  "game_id"
    t.string   "name",                limit: 255
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.integer  "background_image_id"
  end

  create_table "campaigns", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "games", force: :cascade do |t|
    t.string   "status",      limit: 255
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.string   "name",        limit: 255
    t.integer  "user_id"
    t.integer  "campaign_id"
  end

  create_table "images", force: :cascade do |t|
    t.integer  "campaign_id"
    t.string   "filename",    limit: 255
    t.binary   "data"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "type",        limit: 255
  end

  create_table "initiative_histories", force: :cascade do |t|
    t.integer  "game_id"
    t.string   "name",       limit: 255
    t.integer  "use_count"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "initiative_histories", ["game_id"], name: "index_initiative_histories_on_game_id"
  add_index "initiative_histories", ["name"], name: "index_initiative_histories_on_name"

  create_table "initiatives", force: :cascade do |t|
    t.integer  "game_id"
    t.string   "name",       limit: 255
    t.integer  "value"
    t.integer  "sort_order"
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  create_table "users", force: :cascade do |t|
    t.string   "email",           limit: 255
    t.string   "name",            limit: 255
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.string   "password_digest", limit: 255
    t.boolean  "is_admin"
    t.string   "auth_token",      limit: 255
    t.string   "username"
  end

  add_index "users", ["email"], name: "index_users_on_email"

end
