import gwPostBuildTask from './greenworks-setup';
import gwPreBuildTask from './greenworks-postbuild';

import packageTask from './electron/package';
import setup from './electron/setup';

import tauriDev from './tauri/dev';
import tauriSetup from './tauri/setup';

import minifyTask from './minify';
import itchTask from './itch';

export default [
  setup,
  itchTask,
  minifyTask,
  packageTask,
  gwPostBuildTask,
  gwPreBuildTask,
  tauriDev,
  tauriSetup,
];
