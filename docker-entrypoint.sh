#!/bin/bash

# Wait for PostgreSQL to be ready (optional but recommended)
# We assume the database container is named 'db'
echo "Waiting for PostgreSQL..."
while ! pg_isready -h db -p 5432 -U ${DATABASE_USER}; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn server
echo "Starting Gunicorn server..."
exec gunicorn edushare_project.wsgi:application --bind 0.0.0.0:8000 --workers 3
