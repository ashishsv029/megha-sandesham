#!/bin/bash

# apply db migrations

# generate sql files
# npx prisma migrate generate

# apply the sql files on database
 #npx prisma migrate up

# do initial seeding of data
# start app

echo "hello everyone"

node dist/src/app.js