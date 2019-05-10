// Copyright 2019 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.​

// NOTE
// This is a "special" react component that does not strictly play by
// React's rules.
//
// Conceptually, this component creates a "portal" in React by
// closing its render method off from updates (by simply rendering a div and
// never accepting re-renders) then reconnecting itself to the React lifecycle
// by listening for any new props (using componentWillReceiveProps)

// React
import React, { Component } from 'react';

// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as mapActions } from '../../../redux/reducers/map';

// ESRI
import { loadModules } from 'esri-loader';
import { createView } from '../../../utils/esriHelper';

// Styled Components
import styled from 'styled-components';

const Container = styled.div`
  height: 100%;
  width: 100%;
`;

// Variables
const containerID = "map-view-contnainer";

class GeoJsonExampleAsync extends Component {

  componentDidMount() {
    this.startup(
      this.props.config.mapGeoJsonConfig,
      containerID,
      this.props.config.mapGeoJsonConfig.is3DScene
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Tell React to never update this component, that's up to us
    return false;
  }

  render() {
    return (
      <Container ref="mapDiv" id={containerID}></Container>
    );
  }

  // ESRI JSAPI
  startup = (mapConfig, node, isScene = false) => {
    createView(mapConfig, node, isScene).then(
      response => {
        this.init(response);
        this.setupEventHandlers(this.map);
        this.setupWidgetsAndLayers();
        this.finishedLoading();
      },
      error => {
        console.error("maperr", error);
        window.setTimeout(() => {
          this.startup(mapConfig, node);
        }, 1000);
      }
    );
  };

  finishedLoading = () => {
    //Update app state only after map and widgets are loaded
    this.props.mapLoaded();
  };

  init = response => {
    this.view = response.view;
    this.map = response.view.map;
    //this.disableZooming(this.view);
  };
  
  setupWidgetsAndLayers = async () => {
    
    // JSAPI Map Widgets and Layers get loaded here!
    
    const [GeoJSONLayer] = await loadModules(['esri/layers/GeoJSONLayer']);
    const [UniqueValueRenderer]  = await loadModules(['esri/renderers/UniqueValueRenderer']);
    const box = await this.toLatLngExtent(this.view.extent);

    // const defaultHex = {
    //   type: "simple-fill", 
    //   color: [253, 141, 60, 0],
    //   outline: {
    //     color: [128, 128, 128, 0.4],
    //     width: "0.5px"
    //   }
    // };

    const pentagon = {
      type: "simple-fill", 
      color: [253, 141, 60, 1],
      outline: {
        color: [128, 128, 128, 0],
        width: "0.5px"
      }
    };

   // const ur = new UniqueValueRenderer({
    //   field: 'isPentagon',
    //   uniqueValueInfos: [
    //     {value: 'false', symbol: defaultHex},
    //     {value: 'true', symbol: pentagon}
    //   ]
    // }); 

    const class00 = {
      type: "simple-fill", 
      color: [239, 243, 255, 0],
      outline: {
        color: [128, 128, 128, 0],
        width: "0.5px"
      }
    };

    const class01 = {
      type: "simple-fill", 
      color: [239, 243, 255, 0.3],
      outline: {
        color: [128, 128, 128, .2],
        width: "0.5px"
      }
    };

    const class02 = {
      type: "simple-fill", 
      color: [189,215,231, 0.3],
      outline: {
        color: [128, 128, 128, .2],
        width: "0.5px"
      }
    };

    const class03 = {
      type: "simple-fill", 
      color: [107,174,214, 0.3],
      outline: {
        color: [128, 128, 128, .2],
        width: "0.5px"
      }
    };

    const class04 = {
      type: "simple-fill", 
      color: [49,130,189, 0.3],
      outline: {
        color: [128, 128, 128, .2],
        width: "0.5px"
      }
    };

    const class05 = {
      type: "simple-fill", 
      color: [8,81,156, 0.3],
      outline: {
        color: [128, 128, 128, .2],
        width: "0.5px"
      }
    };

    const ur = new UniqueValueRenderer({
      field: 'class',
      uniqueValueInfos: [
        {value: "pentagon", symbol: pentagon},
        {value: "0", symbol: class00},
        {value: "1", symbol: class01},
        {value: "2", symbol: class02},
        {value: "3", symbol: class03},
        {value: "4", symbol: class04},
        {value: "5", symbol: class05}
      ]    
    });

    const [watchUtils] = await loadModules(['esri/core/watchUtils']);
    watchUtils.whenTrue(this.view, "stationary", async () => {
          
      const box = await this.toLatLngExtent(this.view.extent);

      const url = `http://localhost:4000/h3/${box.top_left}/${box.bottom_left}/${box.bottom_right}/${box.top_right}/${this.view.zoom}`;
      console.log(url);

      const geoJsonLayer = new GeoJSONLayer({
        url: url,
        renderer: ur,
        outFields: ["*"]
      });
      
      this.map.removeAll();
      this.map.add(geoJsonLayer);

    });
  };
  
  toLatLngExtent = async (extent) => {
    const [webMercatorUtils] = await loadModules(['esri/geometry/support/webMercatorUtils']);
    const top_left = webMercatorUtils.xyToLngLat(extent.xmin, extent.ymax);
    const bottom_left = webMercatorUtils.xyToLngLat(extent.xmin, extent.ymin);
    const bottom_right = webMercatorUtils.xyToLngLat(extent.xmax, extent.ymin);
    const top_right = webMercatorUtils.xyToLngLat(extent.xmax, extent.ymax);
    return {top_left, bottom_left, bottom_right, top_right};
  };

  disableZooming = (view) => {
    view.popup.dockEnabled = true;

    // Removes the zoom action on the popup
    view.popup.actions = [];

    // stops propagation of default behavior when an event fires
    function stopEvtPropagation(event) {
      event.stopPropagation();
    }

    // exlude the zoom widget from the default UI
    view.ui.components = ["attribution"];

    // disable mouse wheel scroll zooming on the view
    view.on("mouse-wheel", stopEvtPropagation);

    // disable zooming via double-click on the view
    view.on("double-click", stopEvtPropagation);

    // disable zooming out via double-click + Control on the view
    view.on("double-click", ["Control"], stopEvtPropagation);

    // disables pinch-zoom and panning on the view
    //view.on("drag", stopEvtPropagation);

    // disable the view's zoom box to prevent the Shift + drag
    // and Shift + Control + drag zoom gestures.
    //view.on("drag", ["Shift"], stopEvtPropagation);
    //view.on("drag", ["Shift", "Control"], stopEvtPropagation);

    // prevents zooming with the + and - keys
    view.on("key-down", function(event) {
      var prohibitedKeys = ["+", "-", "Shift", "_", "="];
      var keyPressed = event.key;
      if (prohibitedKeys.indexOf(keyPressed) !== -1) {
        event.stopPropagation();
      }
    });
  };
  
  setupEventHandlers = map => {
    
    loadModules([], () => {
      
      //
      // JSAPI Map Event Handlers go here!
      //
    
    });
  };

  mapResized = (e) => {
    console.log(e);
  }
}

const mapStateToProps = state => ({
  config: state.config,
  map: state.map
});

const mapDispatchToProps = function (dispatch) {
  return bindActionCreators({
    ...mapActions
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps) (GeoJsonExampleAsync);

// let base = 0.12086092715231789;
// if(Math.floor(this.view.zoom == 3)) {
//   base = 0.12086092715231789;
// }

// if(Math.floor(this.view.zoom == 4)) {
//   base = 0.07560706401766004;
// }

// if(Math.floor(this.view.zoom == 5)) {
//   base = 0.05408388520971302;
// }

// const break_point = base/4;
// //const break_point = 0.07560706401766004/4;

// let b1 = break_point;
// let b2 = 2 * break_point;
// let b3 = 3 * break_point;
// let b4 = 4 * break_point;

// console.log(b1);
// console.log(b2);
// console.log(b3);
// console.log(b4);

// let break0 = {
//   type: "simple-fill", // autocasts as new SimpleFillSymbol()
//   color: [255, 255, 255, 0],
//   style: "solid",
//   outline: {
//     width: 0.2,
//     color: [255, 255, 255, 0]
//   }
// };

// let break01 = {
//   type: "simple-fill", // autocasts as new SimpleFillSymbol()
//   color: [255, 255, 255, 0],
//   style: "solid",
//   outline: {
//     width: 0.2,
//     color: [255, 255, 255, 0]
//   }
// };

// let break02 = {
//   type: "simple-fill", // autocasts as new SimpleFillSymbol()
//   color: "#b1cdc2",
//   style: "solid",
//   outline: {
//     width: 0.2,
//     color: [255, 255, 255, 0]
//   }
// };

// let break03 = {
//   type: "simple-fill", // autocasts as new SimpleFillSymbol()
//   color: "#38627a",
//   style: "solid",
//   outline: {
//     width: 0.2,
//     color: [255, 255, 255, 0]
//   }
// };

// let break04 = {
//   type: "simple-fill", // autocasts as new SimpleFillSymbol()
//   color: "#0d2644",
//   style: "solid",
//   outline: {
//     width: 0.2,
//     color: [255, 255, 255, 0]
//   }
// };

// let renderer = {
//   type: "class-breaks", // autocasts as new ClassBreaksRenderer()
//   field: "meteor_count", // total number of adults (25+) with a college degree
//   normalizationField: "tot_meteor_count", // total number of adults 25+
//   defaultSymbol: {
//     type: "simple-fill", // autocasts as new SimpleFillSymbol()
//     color: [50, 50, 50, .5],
//     style: "solid",
//     outline: {
//       width: 0.5,
//       color: [255, 255, 255, 0]
//     }
//   },
//   defaultLabel: "no data",
//   classBreakInfos: [
//     {
//       minValue: 0,
//       maxValue: 0,
//       symbol: break0
//     },
//     {
//       minValue: .001,
//       maxValue: b2 - .001,
//       symbol: break01
//     },
//     {
//       minValue: b2,
//       maxValue: b3 - .001,
//       symbol: break02
//     },
//     {
//       minValue: b3,
//       maxValue: b4 - .001,
//       symbol: break03
//     },
//     {
//       minValue: b4,
//       maxValue: 1,
//       symbol: break04
//     }
//   ] // legend label for features that don't match a class break
// };
//https://odoe.github.io/psdw-2019/ArcGIS-API-4-for-JavaScript-Arcade-Deep-Dive/index.html#/24
//https://github.com/odoe/psdw-2019/blob/b3a82718729bc856bc5614d651502f4252cf11e2/ArcGIS-API-4-for-JavaScript-Arcade-Deep-Dive/presentation.md
//https://codepen.io/odoe/pen/wZVPzo?editors=1000
//https://www.researchgate.net/profile/Timothy_Ohiggins/publication/326579661_Fold_your_own_globe/links/5b5734c845851507a7c52dce/Fold-your-own-globe.pdf

// attempting to query GeoJsonLayer here, error.
// const layerView = await this.view.whenLayerView(geoJsonLayer);
// console.log('layerView', layerView);
// const [watchUtils] = await loadModules(['esri/core/watchUtils']);
// console.log('watchUtils', watchUtils);
// const isDoneUpdating = await watchUtils.whenFalseOnce(layerView, "updating");
// console.log(isDoneUpdating);
// console.log('done updating');
// const query = geoJsonLayer.createQuery();
// query.where = "isPentagon = 'false'";
// const featureSet = await layerView.queryFeatures(query);
// console.log('featureset', featureSet);