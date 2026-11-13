#!/usr/bin/env sh
set -eu
cp -n .env.example .env
docker compose up --build
