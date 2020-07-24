# Data

To power the [OpenStreetMap Bins explorer](https://odileeds.github.io/osmedit/bins/) we generate static GeoJSON "tiles" arranged in the following structure:

`https://odileeds.github.io/osmedit/bins/{z}/{x}/{y}.geojson`

We have a cronjob that downloads [OSM data for "Great Britain" from Geofabrik](http://download.geofabrik.de/europe/great-britain.html) once a day. That file is around 1.1GB in size. We use `ogr2ogr` to extract all the points into a GeoJSON file. We process each line of that file and extract every line `amenity=waste_basket` or `amenity=recycling`. Each matching node has it's tile coordinates calculted (based on zoom level 12) and is saved to the appropriate tile file. For GB, the resulting directory is around 15MB in size and individual tiles are generally under 200kB and often much smaller than that.
