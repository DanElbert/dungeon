#! /bin/bash

if [ "$SHARE_ASSETS" = "true" ]; then
	cp -Rp /dungeon_assets/public/* /dungeon/public/
fi
