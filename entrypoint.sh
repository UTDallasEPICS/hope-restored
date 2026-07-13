#!/bin/sh

# Change to admin dir to run prisma commands
cd /app

# Apply migrations and initialize migrations if it does not exist
pnpm prisma generate
pnpm prisma migrate deploy
# pnpm prisma db seed

# Go back to app dir
cd /app

# Run the CMD command from the dockerfile
exec "$@"
