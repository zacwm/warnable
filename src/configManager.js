// Warnable v3 | Server Config Manager

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const configTest = require('./common/configTest');
const logs = require('./common/logs');

const configFiles = chokidar.watch(path.join(__dirname, '../configs/servers'));

configFiles.on('add', (dir) => {
  const FileName = dir.match(/(\d+)\.json/);
  if (!FileName) return logs.console('config', `Failed to load server config '${dir}'`);
  const FileData = JSON.parse(fs.readFileSync(dir));
  configTest(FileData)
  .then(() => {
    if (!process.servers) process.servers = {};
    process.servers[FileName[1]] = FileData;
    logs.console('config', `Updated server config for '${FileName[1]}'`);
  })
  .catch((errReason) => {
    logs.console('config', `FAILED to load server config for '${FileName[1]}'. Reason: ${errReason}`);
  });
});

configFiles.on('change', (dir) => {
  const FileDirArray = dir.split('\\');
  const FileName = FileDirArray[FileDirArray.length - 1];
  const ServerID = FileName.replace('.json', '');
  if (ServerID == 'template') { return; }
  else if (!/\d+\.json/.test(FileName)) {
    logs.console('config', `FAILED to load server config file '${FileName}'. Reason: Invalid server ID for file name.`);
    return;
  }
  const FileData = JSON.parse(fs.readFileSync(dir));
  configTest(FileData)
  .then(() => {
    if (!process.servers) process.servers = {};
    process.servers[ServerID] = FileData;
    logs.console('config', `Updated server config for '${ServerID}'`);
  })
  .catch((errReason) => {
    logs.console('config', `FAILED to load server config for '${ServerID}'. Reason: ${errReason}`);
  });
});

configFiles.on('unlink', (dir) => {
  if (!process.servers) return;
  const FileDirArray = dir.split('\\');
  const ServerID = FileDirArray[FileDirArray.length - 1].replace('.json', '');
  if (process.servers[ServerID]) {
    delete process.servers[ServerID];
    logs.console('config', `Config for server '${ServerID}' was deleted.`);
  }
});