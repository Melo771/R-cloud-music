import React from 'react';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config'; // renderRoutes 读取路由配置转化为 Route 标签
import { HashRouter } from 'react-router-dom';

import routes from './routes';
import store from './store';

import { IconStyle } from './assets/iconfont/iconfont';
import { GlobalStyle } from './style';

function App () {
  return (
    <Provider store={store}>
      <HashRouter>
        <GlobalStyle></GlobalStyle>
        <IconStyle></IconStyle>
        {renderRoutes(routes)}
    </HashRouter>
    </Provider>
  );
}

export default App;