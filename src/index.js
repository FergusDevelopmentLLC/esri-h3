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

// React //
import React from 'react';
import ReactDOM from 'react-dom';

// Redux //
import { Provider } from 'react-redux';
import { initStore } from './redux/store';

// React Router //
import { BrowserRouter, Route } from 'react-router-dom';

// Components //
import { homepage } from '../package.json';
import App from './components/App';

// Styles //
import CalciteThemeProvider from 'calcite-react/CalciteThemeProvider';
import { GlobalStyle } from './styles/global';
import './styles/fonts.css';

// App runs at the root locally, but under /{homepage} in production
let basename;
process.env.NODE_ENV !== 'production' ? (basename = '') : (basename = homepage);

// Create Redux Store
export const store = initStore();

// App entry point
ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter basename={basename}>
      <CalciteThemeProvider>
        <GlobalStyle />
        <Route path='/' component={App} />
      </CalciteThemeProvider>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
)
