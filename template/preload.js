delete window.module;

// eslint-disable-next-line
const electron         = require('electron');
const { ConfigLoader } = require('@efc/core');

const loader = new ConfigLoader();

/**
 *
 * -- Functions --
 *
 */

const _appendScript = src => new Promise((resolve) => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.onload = () => {
    resolve(true);
  };
  script.src = src;
  document.getElementsByTagName('head')[0].appendChild(script);
});

/**
 *
 * -- Main --
 *
 */

// Load default config and local config and merge them
loader.load().then((conf) => {
  const settings = conf.mixed;

  if (settings.debug.showConfig) console.log(settings);

  document.addEventListener('DOMContentLoaded', () => {
    if (!settings.developer.showConstructDevTools) return;

    // enable devtool
    Promise.resolve()
      .then(() => _appendScript('https://unpkg.com/vue'))
      .then(() => {
        Vue.config.productionTip = false;
        Vue.config.devtools = false;

        console.log('adding vue');

        return _appendScript('https://gitcdn.xyz/repo/ElectronForConstruct/construct-devtool/master/dist/construct-devtool.min.js');
      })
      .then(() => {
        const dt = document.createElement('construct-devtool');
        dt.style.position = 'fixed';
        document.body.append(dt);
        console.log('adding devtool');
      });
  });

  document.addEventListener('reloadPage', () => {
    electron.remote.getCurrentWindow().reload();
  }, false);

  document.addEventListener('openDevTools', () => {
    electron.remote.getCurrentWindow().webContents.openDevTools();
  }, false);

  setInterval(() => {
    const elem = document.querySelector('.remotePreviewNotification');
    if (elem) {
      switch (elem.textContent) {
        case 'Host disconnected':
          if (settings.developer.autoClose) electron.remote.getCurrentWindow().close();
          break;
        case 'Host updated project':
          if (settings.developer.autoReload) electron.remote.getCurrentWindow().reload();
          break;
        default:
          break;
      }
    }
  }, 1000);
});
