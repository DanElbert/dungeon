#! /bin/bash

if [ "$DB_MIGRATE" == "true" ]; then
    bundle exec rails db:migrate
fi

if [ "$COPY_ASSETS" == "true" ]; then
    rsync -a --delete /dungeon/public/assets/ /dungeon_assets
fi

cd /dungeon
bundle exec rails s -b 0.0.0.0
