#!/bin/bash

KEY=`cat keys.txt`

curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=$KEY&location=40.8058911,-73.9554152&types=restaurant&rankby=distance" > places.json

next_page_token=`grep "next_page_token" places.json | sed -e "s/ *\"next_page_token\" : \"//g" | sed -e "s/\",//g"`

sleep 2

while [ 1 ]
do
    curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=$KEY&location=40.8058911,-73.9554152&types=restaurant&rankby=distance&pagetoken=$next_page_token" >> places.json
    new_next_page_token=`grep "next_page_token" places.json | tail -1 | sed -e "s/ *\"next_page_token\" : \"//g" | sed -e "s/\",//g"`
    if [ "$new_next_page_token" == "$next_page_token" ]
    then
       break
    fi
    next_page_token=$new_next_page_token
    sleep 2
done
