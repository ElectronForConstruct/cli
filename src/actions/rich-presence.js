const request = require('request');
const { Command } = require('@efc/core');

module.exports = class extends Command {
  constructor() {
    super('rich-presence', 'Configure Discord Rich Presence');

    this.setCategory('Publish');
  }

  isVisible() {
    return false;
  }

  overrideConfiguration() {
    const { mixed } = this.config;

    const config = {
      greenworks: {
        steamId: 480,
        sdkPath: 'steam_sdk',
        useLocalBuild: false,
      },
      build: {
        files: [
          '!node_modules/greenworks/**',
          '!node_modules/app-builder-bin/**',
          '!node_modules/app-builder-lib/**',
          `!${mixed.greenworks.sdkPath}/**`,
        ],
      },
    };

    return config;
  }

  /**
   * Utils
   */

  githubFileDownload(url, json = false) {
    return new Promise((resolve, reject) => {
      request.get({
        url,
        json,
      }, (e, r, content) => {
        if (e) reject(e);
        resolve(content);
      });
    });
  }

  /**
   * Command
   */

  async onPreBuild() {
    await this.run();
  }

  async run() {
  }
};
