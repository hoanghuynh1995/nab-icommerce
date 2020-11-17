#!/bin/bash
set -e

ECHO INITDB
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
EOSQL