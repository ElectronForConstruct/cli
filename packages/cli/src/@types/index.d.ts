declare module 'github-trees'
declare module 'github-content'
declare module 'dumper.js' {
  const dump: {
    (
      obj: any
    ): void;
  };

  const dd: {
    (
      obj: any
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

declare module 'download-tarball' {
  function download({
    url: string,
    dir: string,
  }): Promise<any>;
  export = download
}

declare module 'string-replace-all-ponyfill' {
  function replaceAll(str: string, regex: RegExp | string, fn: string | (() => string)): string
  export = replaceAll
}
