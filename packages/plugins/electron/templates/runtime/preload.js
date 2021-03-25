// delete window.module;

// // eslint-disable-next-line
// const electron = require('electron');
// const settings = require('./config');

// /**
//  *
//  * -- Functions --
//  *
//  */

// const _appendScript = src => new Promise((resolve) => {
//   const script = document.createElement('script');
//   script.type = 'text/javascript';
//   script.async = true;
//   script.onload = () => {
//     resolve(true);
//   };
//   script.src = src;
//   document.getElementsByTagName('head')[0].appendChild(script);
// });

// /**
//  *
//  * -- Main --
//  *
//  */

// if (settings.debug && settings.debug.showConfig) {
//   console.log(settings);
// }

// document.addEventListener('DOMContentLoaded', () => {
//   if (settings.developer && settings.developer.overlay) {
//     const { overlay } = settings.developer;

//     const parent = document.createElement('span');

//     const { position } = overlay;

//     const vertical = position.split('-')[0];
//     const horizontal = position.split('-')[1];

//     if (vertical !== 'top' && vertical !== 'bottom') {
//       console.warn('Only "top" and "bottom" are supported as let part of the position!');
//       return;
//     }

//     if (horizontal !== 'left' && horizontal !== 'right') {
//       console.warn('Only "left" and "right" are supported as right part of the position!');
//       return;
//     }

//     parent.style[horizontal] = 0;
//     parent.style[vertical] = 0;
//     parent.style.padding = '5px';
//     parent.innerHTML = overlay.content;
//     parent.style.position = 'fixed';

//     document.body.append(parent);
//   }

//   if (!settings.developer.showConstructDevTools) {
//     return;
//   }

//   // enable devtool
//   Promise.resolve()
//     .then(() => {
//       return _appendScript('https://cdn.jsdelivr.net/gh/ElectronForConstruct/construct-devtool/dist/construct-devtool.min.js');
//     })
//     .then(() => {
//       const dt = document.createElement('construct-devtool');
//       document.body.append(dt);
//     });
// });

// document.addEventListener('reloadPage', () => {
//   electron.remote.getCurrentWindow().reload();
// }, false);

// document.addEventListener('openDevTools', () => {
//   electron.remote.getCurrentWindow().webContents.openDevTools();
// }, false);

// setInterval(() => {
//   const elem = document.querySelector('.remotePreviewNotification');
//   if (elem) {
//     switch (elem.textContent) {
//       case 'Host disconnected':
//         if (settings.developer.autoClose) {
//           electron.remote.getCurrentWindow().close();
//         }
//         break;
//       case 'Host updated project':
//         if (settings.developer.autoReload) {
//           electron.remote.getCurrentWindow().reload();
//         }
//         break;
//       default:
//         break;
//     }
//   }
// }, 1000);
