import gwPostBuildHook from './greenworks-setup';
import gwPreBuildHook from './greenworks-postbuild';
import packageHook from './package';
import minifyHook from './minify';
import itchHook from './itch';

export default [
  itchHook,
  minifyHook,
  packageHook,
  gwPostBuildHook,
  gwPreBuildHook,
];
