#!/bin/bash

# apply db migrations

echo "applying prisma schema migations..."

# apply the sql files on database
npx prisma migrate deploy

# do initial seeding of data
# start app

echo "starting the application..."

node dist/src/app.js


