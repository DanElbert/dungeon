#! /bin/bash

if [ "$SHARE_ASSETS" = "true" ]; then
	mkdir -p /dungeon_assets/
	cp -Rp /dungeon/public /dungeon_assets
fi
