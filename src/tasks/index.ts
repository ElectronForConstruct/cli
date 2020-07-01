import gwPostBuildTask from './greenworks-setup';
import gwPreBuildTask from './greenworks-postbuild';
import packageTask from './electron/package';
import minifyTask from './minify';
import itchTask from './itch';
import setup from './electron/setup';

export default [
  setup,
  itchTask,
  minifyTask,
  packageTask,
  gwPostBuildTask,
  gwPreBuildTask,
];
