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

class GeoJsonExamplePromise extends Component {

  componentDidMount() {
    this.startup(
      this.props.config.mapConfig,
      containerID,
      this.props.is3DScene
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
  };

  setupWidgetsAndLayers = () => {
    new Promise(() => {
      return this.toLatLngExtent(this.view.extent)
        .then((latLngBox) => {
          return loadModules(['esri/layers/GeoJSONLayer'])
          .then(([GeoJSONLayer]) => {
            const geoJsonLayer = new GeoJSONLayer({
              url: `http://localhost:4000/h3/${latLngBox.top_left}/${latLngBox.bottom_left}/${latLngBox.bottom_right}/${latLngBox.top_right}`
            });
            this.map.add(geoJsonLayer);
          })
        })
      });
  };

  toLatLngExtent = (extent) => {
    return new Promise((resolve) => {
      loadModules(['esri/geometry/support/webMercatorUtils'])
        .then(([webMercatorUtils]) => {
          const top_left = webMercatorUtils.xyToLngLat(extent.xmin, extent.ymax);
          const bottom_left = webMercatorUtils.xyToLngLat(extent.xmin, extent.ymin);
          const bottom_right = webMercatorUtils.xyToLngLat(extent.xmax, extent.ymin);
          const top_right = webMercatorUtils.xyToLngLat(extent.xmax, extent.ymax);
          const latLngBox = {top_left, bottom_left, bottom_right, top_right};
          resolve(latLngBox);
        })
    });
  };
  
  setupEventHandlers = map => {
    loadModules([], () => {
      // JSAPI Map Event Handlers go here!
    });
  };
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

export default connect(mapStateToProps, mapDispatchToProps) (GeoJsonExamplePromise);