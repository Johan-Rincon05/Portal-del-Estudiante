@echo off
set PGPASSWORD=postgres
psql -U postgres -d portal_estudiante -f migrations/manual_migration.sql
pause 