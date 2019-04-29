const geojson2h3 = require('geojson2h3');
//const webMercatorUtils = require('esri/geometry/support/webMercatorUtils');

exports.getH3BinsForExtent = function(req, res) {
  const polygon = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        req.params.top_left.split(',').map(Number),
        req.params.bottom_left.split(',').map(Number),
        req.params.bottom_right.split(',').map(Number),
        req.params.top_right.split(',').map(Number),
        req.params.top_left.split(',').map(Number)
      ]]
    }
  };

  const hexagons = geojson2h3.featureToH3Set(polygon, 3);
  const feature = geojson2h3.h3SetToFeature(hexagons);
  res.header("Access-Control-Allow-Origin", "*");
  res.json(feature);
};