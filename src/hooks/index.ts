import gwPostBuildHook from './greenworks-setup';
import gwPreBuildHook from './greenworks-postbuild';
import packageHook from './electron/package';
import minifyHook from './minify';
import itchHook from './itch';
import setup from './electron/setup';

export default [
  setup,
  itchHook,
  minifyHook,
  packageHook,
  gwPostBuildHook,
  gwPreBuildHook,
];
