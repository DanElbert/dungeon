#! /bin/bash

if [ "$DB_MIGRATE" == "true" ]; then
    bundle exec rails db:migrate
fi

cd /dungeon
bundle exec rails s -b 0.0.0.0 -p 80
