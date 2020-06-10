import gwPostBuildHook from './greenworks-postbuild';
import gwPreBuildHook from './greenworks-prebuild';
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
