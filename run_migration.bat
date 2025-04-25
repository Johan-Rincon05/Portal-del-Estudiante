@echo off
set PGPASSWORD=postgres
psql -U postgres -d websocketchat -f migrations/manual_migration.sql
pause 