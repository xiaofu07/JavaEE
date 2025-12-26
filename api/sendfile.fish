#!/bin/fish

set file $argv[1]
set dir (status dirname)
set host localhost
set port 8080
set bucket firefox
set user lingshin
set url = http://$host:$port
set type (file -i $file | choose 1 | choose -f ';' 0)

set name (basename $file)

curl -X POST 'http://localhost:8080/login' -s \
     -H 'Content-Type:application/json' \
     --data-binary '{ "username": "lingshin", "password": "emiya" }' \
     -c $dir/cookies.txt > /dev/null

curl -X POST $url/blob/$user/$bucket/$name \
     -H "Upload-Hash: "(md5sum $file | choose 0) \
     -H "Content-Type: $type" \
     --data-binary "@$file" \
     -b $dir/cookies.txt -s | jq
