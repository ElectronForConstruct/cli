declare module 'github-trees'
declare module 'github-content'
declare module 'dumper.js' {
  const dump: {
    (
      obj: object
    ): void;
  };

  const dd: {
    (
      obj: object
    ): void;
  };

  export { dump, dd };
}
declare module 'launch-editor' {
  const launch: {
    (
      position: string,
      editor?: string,
      errorCallback?: (fileName: string, errorMsg: string) => void
    ): void;
  };

  export default launch;
}

declare module 'prompt-confirm'
declare module 'yarn'
declare module 'fs-extra'
