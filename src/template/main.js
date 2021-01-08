// eslint-disable-next-line
const electron = require('electron');

const { app, BrowserWindow } = electron;
// const fs = require('fs');
const path = require('path');
const handler = require('serve-handler');
const http = require('http');
const getPort = require('get-port');
const settings = require('./config');

// const ipc = electron.ipcMain;
// const { Client } = require('discord-rpc');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

// Rich Presence only works with IPC, and so it won't work in browser
// const client = new Client({ transport: 'ipc' });

let mainWindow;

// eslint-disable-next-line
const args = global.args = process.argv;

console.log(args);
console.log(__dirname);
console.log(path.resolve('.'));

const url = args[2] || __dirname;
const isURL = url.includes('http');

if (settings.debug.showConfig) {
  console.log(settings);
}

// single instance
const gotTheLock = app.requestSingleInstanceLock();
if (settings.singleInstance && !gotTheLock) {
  app.quit();
}

// crash reporter
if (settings['crash-reporter']) {
  if (!settings['crash-reporter'].companyName) {
    if (settings.project.author) {
      settings['crash-reporter'].companyName = settings.project.author;
    } else {
      settings['crash-reporter'].companyName = 'MyCompany';
    }
  }
  electron.crashReporter.start(settings['crash-reporter']);
}

/* Switches */
try {
  const { switches } = settings;

  switches.forEach((flag) => {
    if (Array.isArray(flag)) {
      app.commandLine.appendSwitch(flag[0], flag[1]);
    } else {
      app.commandLine.appendSwitch(flag);
    }
  });
} catch (e) {
  console.log('No command line switches provided');
}

function createWindow() {
  const { window } = settings;

  const defaultConfig = {
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  };

  const finalConfig = { ...window, ...defaultConfig };

  mainWindow = new BrowserWindow(finalConfig);

  if (!window.menu) {
    try {
      mainWindow.setMenu(null);
    } catch (e) {
      console.log('Unable to remove menu');
    }
  }

  const ses = mainWindow.webContents.session;
  ses.clearStorageData({
    storages: ['cachestorage', 'serviceworkers'],
  }).then(() => {
    console.log('storage cleared');
  }).catch((e) => {
    console.log('Error clearing cache:', e);
  });

  if (isURL) {
    mainWindow.loadURL(url);
  } else {
    const server = http.createServer((request, response) => {
      handler(request, response, {
        public: url,
      });
    });

    getPort({ port: 1212 }).then((port) => {
      server.listen(port, () => {
        console.log(`Running at http://localhost:${port}`);

        mainWindow.loadURL(`http://localhost:${port}`);
      });
    });
  }

  if (settings.developer.showChromeDevTools) {
    mainWindow.webContents.openDevTools();
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

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
