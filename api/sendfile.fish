#!/bin/fish

set file $argv[1]
set dir (status dirname)
<<<<<<< HEAD
set host localhost
=======
set host gungnir
>>>>>>> 74f91227fa0a969524001269cbd4d594d80978cd
set port 8080
set bucket firefox
set user lingshin
set url = http://$host:$port
set type (file -i $file | choose 1 | choose -f ';' 0)

set name (basename $file)

<<<<<<< HEAD
curl -X POST 'http://localhost:8080/login' -s \
=======
curl -X POST $url/login -s \
>>>>>>> 74f91227fa0a969524001269cbd4d594d80978cd
     -H 'Content-Type:application/json' \
     --data-binary '{ "username": "lingshin", "password": "emiya" }' \
     -c $dir/cookies.txt > /dev/null

curl -X POST $url/blob/$user/$bucket/$name \
     -H "Upload-Hash: "(md5sum $file | choose 0) \
     -H "Content-Type: $type" \
     --data-binary "@$file" \
     -b $dir/cookies.txt -s | jq
