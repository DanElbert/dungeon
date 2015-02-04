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

ActiveRecord::Schema.define(version: 20140706211159) do

  create_table "board_actions", force: :cascade do |t|
    t.string   "action_type", limit: 255
    t.string   "uid",         limit: 255
    t.text     "properties",  limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "board_id",    limit: 4
  end

  create_table "board_detection_sessions", force: :cascade do |t|
    t.integer  "game_id",           limit: 4
    t.integer  "detect_width",      limit: 4
    t.integer  "detect_height",     limit: 4
    t.integer  "image_orientation", limit: 4
    t.string   "state",             limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "detect_origin_x",   limit: 4
    t.integer  "detect_origin_y",   limit: 4
    t.integer  "pattern_size",      limit: 4
    t.integer  "pattern_dimension", limit: 4
    t.binary   "image",             limit: 4294967295
  end

  create_table "boards", force: :cascade do |t|
    t.integer  "game_id",             limit: 4
    t.string   "name",                limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "background_image_id", limit: 4
  end

  create_table "campaigns", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.integer  "user_id",    limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "games", force: :cascade do |t|
    t.string   "status",      limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",        limit: 255
    t.integer  "user_id",     limit: 4
    t.integer  "campaign_id", limit: 4
  end

  create_table "images", force: :cascade do |t|
    t.integer  "campaign_id", limit: 4
    t.string   "filename",    limit: 255
    t.binary   "data",        limit: 4294967295
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "type",        limit: 255
  end

  create_table "initiative_histories", force: :cascade do |t|
    t.integer  "game_id",    limit: 4
    t.string   "name",       limit: 255
    t.integer  "use_count",  limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "initiative_histories", ["game_id"], name: "index_initiative_histories_on_game_id", using: :btree
  add_index "initiative_histories", ["name"], name: "index_initiative_histories_on_name", using: :btree

  create_table "initiatives", force: :cascade do |t|
    t.integer  "game_id",    limit: 4
    t.string   "name",       limit: 255
    t.integer  "value",      limit: 4
    t.integer  "sort_order", limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", force: :cascade do |t|
    t.string   "email",           limit: 255
    t.string   "name",            limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "password_digest", limit: 255
    t.boolean  "is_admin",        limit: 1
    t.string   "auth_token",      limit: 255
  end

end
