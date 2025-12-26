#!/bin/fish

set -x LC_ALL C.UTF-8
alias sql 'psql --host gungnir -d '(default babylon $argv)
sql -f (sql -c '\dt' | rg 'table ' | choose 2 | xargs printf 'drop table %s cascade;' | push)
