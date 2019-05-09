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

  let resolution = 1;
  if(parseFloat(req.params.zoom) < 4.5)
    resolution = 2;
  else if (parseFloat(req.params.zoom) >= 4.5 && parseFloat(req.params.zoom) < 6)
    resolution = 3;
  else if (parseFloat(req.params.zoom) >= 6 && parseFloat(req.params.zoom) < 7.5)
    resolution = 4;
  else if (parseFloat(req.params.zoom) >= 7.5 && parseFloat(req.params.zoom) < 9)
    resolution = 5;
  else if (parseFloat(req.params.zoom) >= 9 && parseFloat(req.params.zoom) < 10.5)
    resolution = 6;
  else if (parseFloat(req.params.zoom) >= 10.5 && parseFloat(req.params.zoom) < 12)
    resolution = 7;
  else if (parseFloat(req.params.zoom) >= 12 && parseFloat(req.params.zoom) < 13.5)
    resolution = 8;
  else if (parseFloat(req.params.zoom) >= 13.5 && parseFloat(req.params.zoom) < 15)
    resolution = 9;
  else if (parseFloat(req.params.zoom) >= 15 && parseFloat(req.params.zoom) < 16.5)
    resolution = 10;
  else if (parseFloat(req.params.zoom) >= 16.5 && parseFloat(req.params.zoom) < 18)
    resolution = 11;
  else if (parseFloat(req.params.zoom) >= 18 && parseFloat(req.params.zoom) < 19.5)
    resolution = 12;
  else if (parseFloat(req.params.zoom) >= 19.5 && parseFloat(req.params.zoom) < 21)
    resolution = 13;
  else if (parseFloat(req.params.zoom) >= 21 && parseFloat(req.params.zoom) < 22.5)
    resolution = 14;
  else if (parseFloat(req.params.zoom) >= 22.5)
    resolution = 15;

  const hexagons = geojson2h3.featureToH3Set(polygon, resolution);
  const feature = geojson2h3.h3SetToFeatureCollection(hexagons);
  //console.log(feature);

  res.header("Access-Control-Allow-Origin", "*");

  for (let i = 0; i < feature.features.length; i++) { 
    
    //console.log(feature.features[i].geometry.coordinates[0].length);
    
    feature.features[i].properties.id = feature.features[i].id;
    feature.features[i].properties.isPentagon = 'false';
    
    //faulty logic, pentagons don't always have 6 coordinates at every zoom level
    if(feature.features[i].geometry.coordinates[0].length == 6) {
      feature.features[i].properties.isPentagon = 'true';
    }
  }

  const h3_01_data = require('./data/h3_01_data.json');
  const h3_02_data = require('./data/h3_02_data.json');
  const h3_03_data = require('./data/h3_03_data.json');
  const h3_04_data = require('./data/h3_04_data.json');
  const h3_05_data = require('./data/h3_05_data.json');

  for (let i = 0; i < feature.features.length; i++) { 
    
    feature.features[i].properties.meteor_count = 0;
    
    if(resolution == 1) {
      let tot = 0;
      for (let ii = 0; ii < h3_01_data.length; ii++) { 
        if(h3_01_data[ii].id == feature.features[i].id) {
          feature.features[i].properties.meteor_count = h3_01_data[ii].count;
        }
        tot = tot + h3_01_data[ii].count;
      }
      feature.features[i].properties.tot_meteor_count = tot;
      feature.features[i].properties.pct = feature.features[i].properties.meteor_count / feature.features[i].properties.tot_meteor_count;
    }
    else if(resolution == 2) {
      let tot = 0;
      for (let ii = 0; ii < h3_02_data.length; ii++) {
        if(h3_02_data[ii].id == feature.features[i].id) {
          feature.features[i].properties.meteor_count = h3_02_data[ii].count;
        }
        tot = tot + h3_02_data[ii].count;
      }
      feature.features[i].properties.tot_meteor_count = tot;
      feature.features[i].properties.pct = feature.features[i].properties.meteor_count / feature.features[i].properties.tot_meteor_count;
    }
    else if(resolution == 3) {
      let tot = 0;
      for (let ii = 0; ii < h3_03_data.length; ii++) { 
        if(h3_03_data[ii].id == feature.features[i].id) {
          feature.features[i].properties.meteor_count = h3_03_data[ii].count;
        }
        tot = tot + h3_03_data[ii].count;
      }
      feature.features[i].properties.tot_meteor_count = tot;
      feature.features[i].properties.pct = feature.features[i].properties.meteor_count / feature.features[i].properties.tot_meteor_count;
    }
    else if(resolution == 4) {
      let tot = 0;
      for (let ii = 0; ii < h3_04_data.length; ii++) { 
        if(h3_04_data[ii].id == feature.features[i].id) {
          feature.features[i].properties.meteor_count = h3_04_data[ii].count;
        }
        tot = tot + h3_04_data[ii].count;
      }
      feature.features[i].properties.tot_meteor_count = tot;
      feature.features[i].properties.pct = feature.features[i].properties.meteor_count / feature.features[i].properties.tot_meteor_count;
    }
    else if(resolution == 5) {
      let tot = 0;
      for (let ii = 0; ii < h3_05_data.length; ii++) { 
        if(h3_05_data[ii].id == feature.features[i].id) {
          feature.features[i].properties.meteor_count = h3_05_data[ii].count;
        }
        tot = tot + h3_05_data[ii].count;
      }
      feature.features[i].properties.tot_meteor_count = tot;
      feature.features[i].properties.pct = feature.features[i].properties.meteor_count / feature.features[i].properties.tot_meteor_count;
    }
  }

  let max_pct = 0;
  for (let i = 0; i < feature.features.length; i++) {
    if(feature.features[i].properties.pct > max_pct) {
      max_pct = feature.features[i].properties.pct;
    }
  }

  for (let i = 0; i < feature.features.length; i++) {
    feature.features[i].properties.max_pct = max_pct;
  }

  console.log(max_pct);

  res.json(feature);
};

exports.getMeteor = function(req, res) {
  
  const fs = require('fs');

  console.log(__dirname);

  let rawdata = fs.readFileSync(__dirname + '\\meteor.geojson');  
  let meteors = JSON.parse(rawdata);  
  console.log(meteors); 

  res.json(meteors);
};

exports.getGlobeHexagons = function(req, res) {
  const polygon = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-131.6924011707,9.9027199279],[-62.5224792957,9.9027199279],[-62.5224792957,59.4109275135],[-131.6924011707,59.4109275135],[-131.6924011707,9.9027199279]  
      ]]
    }
  };

  // [-90,-180],
  // [-90, 180],
  // [90, 180],
  // [90, -180],
  // [90, -180]

  
  
  let resolution = parseInt(req.params.resolution);
  const hexagons = geojson2h3.featureToH3Set(polygon, resolution);
  const feature = geojson2h3.h3SetToFeatureCollection(hexagons);
  for (let i = 0; i < feature.features.length; i++) { 
    feature.features[i].properties.id = feature.features[i].id;
  }

  const outputFilename = __dirname + '\\h3bins\\' + resolution + '.geojson';
  const fs = require('fs');

  fs.appendFile(outputFilename, JSON.stringify(feature), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
  }); 

  res.json(feature);
  
};

