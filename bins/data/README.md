# Data

To power the [OpenStreetMap Bins explorer](https://odileeds.github.io/osmedit/bins/) we generate static GeoJSON "tiles" arranged in the following structure:

`https://odileeds.github.io/osmedit/bins/data/{z}/{x}/{y}.geojson`

We have a cronjob that downloads [OSM data for "Great Britain" from Geofabrik](http://download.geofabrik.de/europe/great-britain.html) once a day. That file is around 1.1GB in size. We use [`ogr2ogr`](https://gdal.org/programs/ogr2ogr.html) to extract all the points into a GeoJSON file. We process each line of that file and extract every line [`amenity=waste_basket`](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dwaste_basket) or [`amenity=recycling`](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Drecycling). Each matching node has it's tile coordinates calculated (based on zoom level 12) and is saved to the appropriate tile file. For GB, the resulting directory is around 15MB in size and individual tiles are generally under 200kB and often much smaller than that.


## Processing

We download the PBF file with:

`wget http://download.geofabrik.de/europe/great-britain-latest.osm.pbf`

Next we extract all the nodes which are "points" from that file and save it as GeoJSON with one node per line:

`ogr2ogr -overwrite --config OSM_CONFIG_FILE osmconf.ini -skipfailures -f GeoJSON points.geojson great-britain-latest.osm.pbf points`

Given that this resulted in a large file (~900 MB) we have a perl script that processes this file looking for lines with either of the appropriate tags:

```perl
open(FILE,"points.geojson");
while(<FILE>){
  if($_ =~ /\"type\": \"Feature\"/){
    if($_ =~ /\"amenity": \"waste_basket\"/ || $_ =~ /\"amenity\": \"recycling\"/){
      # Process a single line here

      # Use the lat,lon to work out the appropriate tile coordinates
    }
  }
}
close(FILE);
```
