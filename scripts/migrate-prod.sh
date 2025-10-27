#!/bin/bash
# This script runs migrations on Vercel Postgres

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Generating Prisma client..."
npx prisma generate

echo "Database setup complete!"
