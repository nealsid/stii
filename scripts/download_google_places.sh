#!/bin/bash

KEY=`cat keys.txt`

curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=$KEY&location=40.8058911,-73.9554152&types=restaurant&rankby=distance" >> places-1.json

for i in $(seq 999)
do
    curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=$KEY&location=40.8058911,-73.9554152&types=restaurant&rankby=distance&pagetoken" >> places-1.json
done
