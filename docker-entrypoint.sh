#!/bin/sh
set -eu

# Coolify commonly generates database passwords with URL-reserved characters.
# Build the Prisma URL at runtime so those values cannot corrupt it.
if [ -n "${POSTGRES_USER:-}" ] && [ -n "${POSTGRES_PASSWORD:-}" ] && [ -n "${POSTGRES_DB:-}" ]; then
  encode() {
    node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "$1"
  }

  database_user=$(encode "$POSTGRES_USER")
  database_password=$(encode "$POSTGRES_PASSWORD")
  database_name=$(encode "$POSTGRES_DB")
  export DATABASE_URL="postgresql://${database_user}:${database_password}@${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432}/${database_name}?schema=public"
fi

exec "$@"
