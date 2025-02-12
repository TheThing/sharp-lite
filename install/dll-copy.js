'use strict';

const fs = require('fs');
const path = require('path');

const libvips = require('../lib/libvips');
const platform = require('../lib/platform');

const minimumLibvipsVersion = libvips.minimumLibvipsVersion;

const platformAndArch = platform();

if (platformAndArch.startsWith('win32')) {
  const buildReleaseDir = path.join(__dirname, '..', 'build', 'Release');
  console.log(`Creating ${buildReleaseDir}`);
  try {
    libvips.mkdirSync(buildReleaseDir);
  } catch (err) {}
  const vendorLibDir = path.join(__dirname, '..', 'vendor', minimumLibvipsVersion, platformAndArch, 'lib');
  console.log(`Copying DLLs from ${vendorLibDir} to ${buildReleaseDir}`);
  try {
    fs
      .readdirSync(vendorLibDir)
      .filter(function (filename) {
        return /\.dll$/.test(filename);
      })
      .forEach(function (filename) {
        fs.copyFileSync(
          path.join(vendorLibDir, filename),
          path.join(buildReleaseDir, filename)
        );
      });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
