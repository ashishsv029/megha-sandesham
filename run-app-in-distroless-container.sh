#!/bin/sh

# apply db migrations

echo "applying prisma schema migations..."

# apply the sql files on database
ls node_modules/.bin
node_modules/.bin/prisma migrate deploy

# do initial seeding of data
# start app

echo "starting the application..."

/bin/node dist/src/app.js