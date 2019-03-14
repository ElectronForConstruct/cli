// eslint-disable-next-line
const electron = require('electron');

const { app, BrowserWindow } = electron;
// const fs = require('fs');
const path = require('path');
const isDev = require('electron-is-dev');
const handler = require('serve-handler');
const http = require('http');

const { ConfigLoader } = require('@efc/core');

const loader = new ConfigLoader();

// const ipc = electron.ipcMain;
// const { Client } = require('discord-rpc');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

// Rich Presence only works with IPC, and so it won't work in browser
// const client = new Client({ transport: 'ipc' });

let mainWindow;

const args = process.argv;
global.args = args;

loader.load().then((conf) => {
  const settings = conf.mixed;

  if (settings && settings.debug && settings.debug.showConfig) console.log(settings);

  /* Switches */
  try {
    const { switches } = settings;

    switches.forEach((flag) => {
      if (Array.isArray(flag)) app.commandLine.appendSwitch(flag[0], flag[1]);
      else app.commandLine.appendSwitch(flag);
    });
  } catch (e) {
    console.log('No command line switches provided');
  }

  function createWindow() {
    const { window } = settings;

    const defaultConfig = {
      webPreferences: {
        webSecurity: false,
        preload: path.join(__dirname, 'preload.js'),
      },
    };

    const finalConfig = Object.assign({}, window, defaultConfig);

    mainWindow = new BrowserWindow(finalConfig);

    const ses = mainWindow.webContents.session;
    ses.clearStorageData({
      storages: ['cachestorage', 'serviceworkers'],
    }, () => {
      // callback
    });

    if (args[2] && args[2].match('http')) {
      console.log('Preview development version');
      mainWindow.loadURL(args[2]);
    } else {
      if (args[2]) console.log('Preview local version');
      else console.log('Running prod version');

      const server = http.createServer((request, response) => {
        handler(request, response, {
          public: args[2] ? args[2] : __dirname,
        });
      });

      server.listen(1212, () => {
        console.log('Running at http://localhost:1212');

        mainWindow.loadURL('http://localhost:1212');
      });
    }

    if (settings && settings.developer && settings.developer.showChromeDevTools) {
      mainWindow.webContents.openDevTools();
    }

    if (isDev) {
      console.log('Running in development');
      // console.log('cmd line arguments : ', args);
    } else {
      console.log('Running in production');
    }

    /* ipc.on('login', function (event, clientId) {
      client.login(clientId);

      client.on('ready', () => {
        event.sender.send('ready', true);

        client.subscribe('ACTIVITY_JOIN', ({ secret }) => {
          console.log('Game Join Request', secret);
        });

        client.subscribe('ACTIVITY_SPECTATE', ({ secret }) => {
          console.log('Game Spectate Request', secret);
        });
      });

      client.on('error', (err) => {
        event.sender.send('error', true);
      });

      client.on('connected', () => {
        event.sender.send('connected', true);
      });
    }); */

    /* ipc.on('setActivity', function (event, state, details, start, end,
    large_image_key, small_image_key, party_id, party_size, party_max) {
      if (party_size <= 0 || party_max <= 0) {
        event.sender.send('error', 'Party must be greater than 0');
        return;
      }

      client.setActivity({
        state         : state,
        details       : details,
        startTimestamp: start,
        endTimestamp  : end,
        largeImageKey : large_image_key,
        smallImageKey : small_image_key,
        partyId       : party_id,
        partySize     : party_size,
        partyMax      : party_max
      }).then((result) => {
        event.sender.send('setActivity', JSON.stringify(result));
      });
    });
    */

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.on('ready', createWindow);

  app.on('window-all-closed', app.quit);
  /* app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
  }); */

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});
