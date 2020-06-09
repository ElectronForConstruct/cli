import gwPostBuildHook from './greenworks-postbuild';
import gwPreBuildHook from './greenworks-prebuild';
import packageHook from './package';

export default [
  packageHook,
  gwPostBuildHook,
  gwPreBuildHook,
];
