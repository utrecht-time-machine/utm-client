import json
import os
import shutil
from shutil import copyfile

#  TO CHECK: Nobelstraat, kromme nieuwegracht 3, De oude spruyt, ...

# {
#   "title": "",
#   "description": "",
#   "story": "",
#   "stationId": "",
#   "coordinates": ""
# }

station_template =   {
    "@context": {
      "geojson": "https://purl.org/geojson/vocab#"
    },
    "type": "Feature",
    "id": "", # https://www.openstreetmap.org/way/700005751
    "geometry": {
      "type": "Point",
      "coordinates": [] # [5.12632, 52.09294]
    },
    "properties": {
      "title": "", # Nobelstraat
      "description": ""
    }
  }

template = {
    "@id": "https://utrechttimemachine.nl/stories/", # 20191000018_belle-van-zuylen-choorstraat
    "@type": "https://utrechttimemachine.nl/ontology/story",
    "title": "", # Haar romans te dun?
    "lang": "nl",
    "recommendedRouteId": {
      "@id": "https://utrechttimemachine.nl/routes/belle-van-zuylen"
    },
    "description": "",
    "featured-image": "/assets/data-models/stories/[ID]/featured.jpg",
    "authors": [
      {
        "@id": "https://utrechttimemachine.nl/authors/HuygensING"
      }
    ],
    "stations": [
      {
        "@id": "" # https://www.openstreetmap.org/way/7057260
      }
    ],
    "tagIds": [
      {
        "@id": "https://www.wikidata.org/wiki/Q123386"
      },
      {
        "@id": "https://www.wikidata.org/wiki/Q36180"
      },
      {
        "@id": "https://www.wikidata.org/wiki/Q8242"
      },
      {
        "@id": "https://www.wikidata.org/wiki/Q2461967"
      }
    ],
    "time-period": {
      "start": "1784",
      "end": "1784"
    },
    "seq": [
      {
        "@id": "https://utrechttimemachine.nl/stories/", #20191000018_belle-van-zuylen-choorstraat
        "@type": "https://utrechttimemachine.nl/scene-types/article",
        "content": "story" # belle-van-zuylen-choorstraat
      }
    ]
  }
with open('./bvz_stories.json', 'r', encoding="utf-8") as f:
    stories_data = json.loads(f.read())
    id_num = 20210000018
    stories_parsed = []
    stations_parsed = []

    for i, story_data in enumerate(stories_data):
        story_parsed = json.loads(json.dumps(template))
        id = '-'.join(story_data["title"].split())
        id = ''.join(char for char in id if (char.isalnum() or char == '-') and char != 'â')
        id = str(id_num) + "_bvz_" + id.lower()

        story_parsed["@id"] += id
        story_parsed["title"] += story_data["title"]
        story_parsed["description"] = story_data["description"]
        story_parsed["featured-image"] = story_parsed["featured-image"].replace("[ID]", id)
        story_parsed["stations"][0]["@id"] = "https://www.openstreetmap.org/node/2709280887" # story_data["stationId"]
        story_parsed["seq"][0]["@id"] += id
        stories_parsed.append(story_parsed)

        station_parsed = json.loads(json.dumps(station_template))
        station_parsed["id"] = story_data["stationId"]
        station_parsed["geometry"]["coordinates"] = story_data["coordinates"]
        stations_parsed.append(station_parsed)

        story_path = f'./parsed-stories/{id}'
        if os.path.isdir(story_path):
          shutil.rmtree(story_path)
        os.mkdir(story_path)
        with open(story_path + '/story.md', 'w', encoding="utf-8") as story_file:
            # TODO: Use actual image source here
            story_content = f'![{story_data["title"]}](/assets/data-models/stories/{id}/featured.jpg)<br><small><utm-source sourceUrl="https://hetutrechtsarchief.nl/beeldmateriaal/detail/ba4692ab-ee67-5856-be4b-1d99c9341969">Image source</utm-source></small>\n\n{story_data["story"]}'
            story_file.write(story_content)

        imgFile = './images/' + str(i+1) + '.jpg'
        copyfile(imgFile, story_path + '/featured.jpg')
        
        id_num += 1

    with open('./stories_parsed.json', 'w', encoding="utf-8") as f:
      f.write(json.dumps(stories_parsed, ensure_ascii=False))
    with open('./stations_parsed.json', 'w', encoding="utf-8") as f:
      f.write(json.dumps(stations_parsed, ensure_ascii=False))

    route_ids = list(map(lambda x: {"@id": x["@id"]}, stories_parsed))
    with open('./route_ids_parsed.json', 'w', encoding="utf-8") as f:
      f.write(json.dumps(route_ids, ensure_ascii=False))