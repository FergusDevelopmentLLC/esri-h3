'use strict';
module.exports = function(app) {
  var h3 = require('../controllers/h3Controller');

  app.route('/h3/:top_left/:bottom_left/:bottom_right/:top_right')
    .get(h3.getH3BinsForExtent)

};