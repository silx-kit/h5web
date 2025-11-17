/* Entry point of `vite.styles.config.js` when building app styles for distribution.
   Includes global app styles and distributed lib styles (so users don't have to import two stylesheets).
   Output is later concatenated with local app styles. */

import 'react-reflex/styles.css';
import '@h5web/lib/styles.css'; // distributed lib styles
