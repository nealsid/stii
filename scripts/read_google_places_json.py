#!/usr/bin/python

import json
import codecs
from anfang.models import Place

with open('/Users/nealsid/stii/anfang/places-small.json', 'r') as content_file:
    content = content_file.read()

content_no_newlines = content.replace('\n', '')
places_info = json.loads(content_no_newlines)

output = codecs.open("output.txt", "w", encoding="utf-8")

for x in places_info:
    if x['status'] != "OK":
        continue
    restaurants = x['results']
    for rest in restaurants:
        place_id = rest['place_id']
        name = rest['name']
        lat = rest['geometry']['location']['lat']
        lng = rest['geometry']['location']['lng']
        p = Place()
        p.name = name
        p.latitude = lat
        p.longitude = lng
        p.google_place_id = place_id
        p.save()
