# Data

We have a process that downloads [OSM data for GB from Geofabrik](http://download.geofabrik.de/europe/great-britain.html) once a day (~1.1GB). It uses `ogr2ogr` to extract all the points with `amenity=waste_basket` or `amenity=recycling`. It then splits up the matching nodes into GeoJSON "tiles" based on a zoom level 12. These are then stored within this directory as static files (~15MB in total).
