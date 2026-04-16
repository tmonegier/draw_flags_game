#!/usr/bin/env python3
"""
Generates public/world-map.svg from world.geojson.

Each country path has data-code="<iso2>" (matching country.service.ts codes)
so ExploreComponent can wire click handlers without per-country logic.

Source: github.com/johan/world.geo.json (public domain).
Projection: plain equirectangular — each country's longitude maps to x, latitude to y.
The canvas is 1000×500 (2:1), with y flipped since SVG y grows downward.

Run once; commit the result. Re-run if the GeoJSON is updated.
"""
import json
import os
import sys
import urllib.request

GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "world-map.svg")

# ISO3 -> ISO2 (matches codes in src/app/services/country.service.ts).
# Entries only exist for geojson features we want to render; unknown ISO3s become a
# neutral data-code so the path still shows up as non-drawable ocean-land filler.
ISO3_TO_ISO2 = {
    'AFG':'af','AGO':'ao','ALB':'al','ARE':'ae','ARG':'ar','ARM':'am','AUS':'au','AUT':'at',
    'AZE':'az','BDI':'bi','BEL':'be','BEN':'bj','BFA':'bf','BGD':'bd','BGR':'bg','BHS':'bs',
    'BIH':'ba','BLR':'by','BLZ':'bz','BOL':'bo','BRA':'br','BRN':'bn','BTN':'bt','BWA':'bw',
    'CAF':'cf','CAN':'ca','CHE':'ch','CHL':'cl','CHN':'cn','CIV':'ci','CMR':'cm','COD':'cd',
    'COG':'cg','COL':'co','CRI':'cr','CUB':'cu','CYP':'cy','CZE':'cz','DEU':'de','DJI':'dj',
    'DNK':'dk','DOM':'do','DZA':'dz','ECU':'ec','EGY':'eg','ERI':'er','ESP':'es','EST':'ee',
    'ETH':'et','FIN':'fi','FJI':'fj','FRA':'fr','GAB':'ga','GBR':'gb','GEO':'ge','GHA':'gh',
    'GIN':'gn','GMB':'gm','GNB':'gw','GNQ':'gq','GRC':'gr','GTM':'gt','GUY':'gy','HND':'hn',
    'HRV':'hr','HTI':'ht','HUN':'hu','IDN':'id','IND':'in','IRL':'ie','IRN':'ir','IRQ':'iq',
    'ISL':'is','ISR':'il','ITA':'it','JAM':'jm','JOR':'jo','JPN':'jp','KAZ':'kz','KEN':'ke',
    'KGZ':'kg','KHM':'kh','KOR':'kr','KWT':'kw','LAO':'la','LBN':'lb','LBR':'lr','LBY':'ly',
    'LKA':'lk','LSO':'ls','LTU':'lt','LUX':'lu','LVA':'lv','MAR':'ma','MDA':'md','MDG':'mg',
    'MEX':'mx','MKD':'mk','MLI':'ml','MLT':'mt','MMR':'mm','MNE':'me','MNG':'mn','MOZ':'mz',
    'MRT':'mr','MWI':'mw','MYS':'my','NAM':'na','NER':'ne','NGA':'ng','NIC':'ni','NLD':'nl',
    'NOR':'no','NPL':'np','NZL':'nz','OMN':'om','PAK':'pk','PAN':'pa','PER':'pe','PHL':'ph',
    'PNG':'pg','POL':'pl','PRK':'kp','PRT':'pt','PRY':'py','PSE':'ps','QAT':'qa','ROU':'ro',
    'RUS':'ru','RWA':'rw','SAU':'sa','SDN':'sd','SEN':'sn','SLB':'sb','SLE':'sl','SLV':'sv',
    'SOM':'so','SRB':'rs','SSD':'ss','SUR':'sr','SVK':'sk','SVN':'si','SWE':'se','SWZ':'sz',
    'SYR':'sy','TCD':'td','TGO':'tg','THA':'th','TJK':'tj','TKM':'tm','TLS':'tl','TTO':'tt',
    'TUN':'tn','TUR':'tr','TWN':'tw','TZA':'tz','UGA':'ug','UKR':'ua','URY':'uy','USA':'us',
    'UZB':'uz','VEN':'ve','VNM':'vn','VUT':'vu','YEM':'ye','ZAF':'za','ZMB':'zm','ZWE':'zw',
    'CS-KM':'xk',  # Kosovo in this dataset
}

W, H = 1000, 500

def project(lon, lat):
    x = (lon + 180) / 360 * W
    y = (90 - lat) / 180 * H
    return x, y

def ring_to_path(ring):
    out = []
    for i, (lon, lat) in enumerate(ring):
        x, y = project(lon, lat)
        out.append(f"{'M' if i == 0 else 'L'}{x:.1f},{y:.1f}")
    out.append("Z")
    return "".join(out)

def geom_to_d(geom):
    t = geom['type']
    coords = geom['coordinates']
    if t == 'Polygon':
        polys = [coords]
    elif t == 'MultiPolygon':
        polys = coords
    else:
        return ""
    parts = []
    for poly in polys:
        for ring in poly:
            parts.append(ring_to_path(ring))
    return " ".join(parts)

def fetch_geojson(path):
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    print(f"Fetching {GEOJSON_URL}…", file=sys.stderr)
    with urllib.request.urlopen(GEOJSON_URL) as r:
        data = json.load(r)
    with open(path, 'w') as f:
        json.dump(data, f)
    return data

def main():
    cache = os.path.join(os.path.dirname(__file__), "world.geojson")
    data = fetch_geojson(cache)

    paths = []
    for feat in data['features']:
        iso3 = feat['id']
        iso2 = ISO3_TO_ISO2.get(iso3)
        if not iso2:
            continue  # skip Antarctica etc.
        d = geom_to_d(feat['geometry'])
        if not d:
            continue
        name = feat['properties'].get('name', '').replace('"', '&quot;')
        paths.append(f'<path data-code="{iso2}" data-name="{name}" d="{d}"/>')

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'preserveAspectRatio="xMidYMid meet">\n'
        + "\n".join(paths)
        + "\n</svg>\n"
    )
    out = os.path.abspath(OUT_PATH)
    with open(out, 'w') as f:
        f.write(svg)
    print(f"Wrote {out} ({len(paths)} countries, {len(svg)} bytes)")

if __name__ == "__main__":
    main()
