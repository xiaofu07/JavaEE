#!/bin/fish

set dir (status dirname)
set host gungnir
set port 8080
set bucket firefox
set user lingshin
set url = http://$host:$port

set name $argv[1]

curl -X POST $url/login -s \
     -H 'Content-Type:application/json' \
     --data-binary '{ "username": "lingshin", "password": "emiya" }' \
     -c $dir/cookies.txt > /dev/null

curl $url/blob/$user/$bucket/$name \
     -b $dir/cookies.txt -s
