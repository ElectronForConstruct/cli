import process from 'process';

export const npm = (process.platform === 'win32' ? 'npm.cmd' : 'npm');
export const electron = (process.platform === 'win32' ? 'electron.cmd' : 'electron');
