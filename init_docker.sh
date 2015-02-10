#! /bin/bash

if ! docker inspect dungeon_db_data >/dev/null 2>&1; then
  echo "Creating data container..."
  docker create -v /var/lib/mysql -v /data --name dungeon_db_data mysql:latest >/dev/null 2>&1
fi

fig build

fig run web bash -c "sleep 10 && rake db:create db:migrate db:seed"
