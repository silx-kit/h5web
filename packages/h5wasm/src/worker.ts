import { expose } from 'comlink';

import api from './worker-api';

expose(api);
