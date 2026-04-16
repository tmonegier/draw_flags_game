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
    'GIN':'gn','GMB':'gm','GNB':'gw','GNQ':'gq','GRC':'gr','GRL':'gl','GTM':'gt','GUY':'gy','HND':'hn',
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

# Countries either missing from the geojson (microstates like Monaco, Vatican,
# Andorra, Singapore, Liechtenstein, ...) or present but too small to click at
# the base zoom level. For each we emit a <circle> marker at its centroid, tagged
# with data-code so the existing click handler treats it like any other country.
# Threshold is the minor-axis length (px at viewBox scale) below which a country
# is considered unclickable without a companion dot.
MIN_CLICKABLE_PX = 3.5
MARKER_LAT_LON = {
    # iso2: (lat, lon, name)
    'mc': (43.7384, 7.4246, 'Monaco'),
    'li': (47.1660, 9.5554, 'Liechtenstein'),
    'ad': (42.5063, 1.5218, 'Andorra'),
    'sm': (43.9424, 12.4578, 'San Marino'),
    'va': (41.9029, 12.4534, 'Vatican City'),
    'mt': (35.9375, 14.3754, 'Malta'),
    'sg': (1.3521, 103.8198, 'Singapore'),
    'bh': (26.0667, 50.5577, 'Bahrain'),
    'mv': (3.2028, 73.2207, 'Maldives'),
    'lu': (49.8153, 6.1296, 'Luxembourg'),
    'cy': (35.1264, 33.4299, 'Cyprus'),
    'cy_n': (35.1856, 33.3823, 'Northern Cyprus'),
    'bb': (13.1939, -59.5432, 'Barbados'),
    'gd': (12.1165, -61.6790, 'Grenada'),
    'kn': (17.3578, -62.7830, 'Saint Kitts and Nevis'),
    'lc': (13.9094, -60.9789, 'Saint Lucia'),
    'vc': (12.9843, -61.2872, 'Saint Vincent and the Grenadines'),
    'ag': (17.0608, -61.7964, 'Antigua and Barbuda'),
    'dm': (15.4150, -61.3710, 'Dominica'),
    'km': (-11.6455, 43.3333, 'Comoros'),
    'sc': (-4.6796, 55.4920, 'Seychelles'),
    'mu': (-20.3484, 57.5522, 'Mauritius'),
    'st': (0.1864, 6.6131, 'São Tomé and Príncipe'),
    'cv': (16.5388, -23.0418, 'Cape Verde'),
    'tv': (-7.1095, 177.6493, 'Tuvalu'),
    'nr': (-0.5228, 166.9315, 'Nauru'),
    'ki': (1.8709, -157.3630, 'Kiribati'),
    'pw': (7.5150, 134.5825, 'Palau'),
    'fm': (7.4256, 150.5508, 'Micronesia'),
    'mh': (7.1315, 171.1845, 'Marshall Islands'),
    'ws': (-13.7590, -172.1046, 'Samoa'),
    'to': (-21.1790, -175.1982, 'Tonga'),
    'ck': (-21.2367, -159.7777, 'Cook Islands'),
    'nu': (-19.0544, -169.8672, 'Niue'),
    'bs': (25.0343, -77.3963, 'Bahamas'),
    'bm': (32.3078, -64.7505, 'Bermuda'),
}

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


def minor_bbox_px(geom):
    """Min of the feature's bbox width/height in viewBox pixels, so we can flag
    countries too small to click without a companion marker."""
    xs, ys = [], []
    def walk(x):
        if isinstance(x, list) and x and isinstance(x[0], (int, float)):
            xs.append(x[0]); ys.append(x[1])
        elif isinstance(x, list):
            for i in x: walk(i)
    walk(geom['coordinates'])
    if not xs:
        return 0
    w_px = (max(xs) - min(xs)) / 360 * W
    h_px = (max(ys) - min(ys)) / 180 * H
    return min(w_px, h_px)

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
    # Countries whose paths are too small to click at base zoom — we'll skip
    # their marker entry from being dropped as "already covered".
    too_small = set()
    rendered = set()
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
        rendered.add(iso2)
        if minor_bbox_px(feat['geometry']) < MIN_CLICKABLE_PX:
            too_small.add(iso2)

    # Marker dots: every missing microstate plus every too-small country that
    # has a centroid entry. Dots go *after* paths so they stack on top and win
    # pointer events over nearby land.
    markers = []
    for iso2, (lat, lon, name) in MARKER_LAT_LON.items():
        if iso2 in rendered and iso2 not in too_small:
            continue  # path is already big enough to click
        x, y = project(lon, lat)
        safe_name = name.replace('"', '&quot;')
        markers.append(
            f'<circle class="marker" data-code="{iso2}" data-name="{safe_name}" '
            f'cx="{x:.1f}" cy="{y:.1f}" r="3"/>'
        )

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'preserveAspectRatio="xMidYMid meet">\n'
        + "\n".join(paths)
        + "\n"
        + "\n".join(markers)
        + "\n</svg>\n"
    )
    out = os.path.abspath(OUT_PATH)
    with open(out, 'w') as f:
        f.write(svg)
    print(f"Wrote {out} ({len(paths)} country paths + {len(markers)} markers, {len(svg)} bytes)")

if __name__ == "__main__":
    main()
