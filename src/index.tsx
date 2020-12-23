import 'react-app-polyfill/stable';

import ReactDOM from 'react-dom';

import 'react-reflex/styles.css';
import 'normalize.css';
import './styles/index.css';

import DemoApp from './demo-app/DemoApp';

ReactDOM.render(<DemoApp />, document.querySelector('#root'));
