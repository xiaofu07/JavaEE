sql := "psql -h gungnir -d babylon"

run:
  gradle bootRun

build:
  gradle build

rebuild:
  sql/remove-all.fish
  {{sql}} -f sql/babylon.sql
  {{sql}} -f sql/data.sql

sql:
  {{sql}}
