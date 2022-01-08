'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const stream = require('stream');
const zlib = require('zlib');

const detectLibc = require('detect-libc');
const semverLessThan = require('semver/functions/lt');
const semverSatisfies = require('semver/functions/satisfies');
// const simpleGet = require('simple-get');
// const tarFs = require('tar-fs');

const utils = require('./utils')
const libvips = require('../lib/libvips');
const platform = require('../lib/platform');
const packageConfig = require('../package.json')

const minimumGlibcVersionByArch = {
  arm: '2.28',
  arm64: '2.29',
  x64: '2.17'
};

const hasSharpPrebuild = [
  'darwin-x64',
  'darwin-arm64',
  'linux-arm64',
  'linux-x64',
  'linuxmusl-x64',
  'linuxmusl-arm64',
  'win32-ia32',
  'win32-x64'
];

const { minimumLibvipsVersion, minimumLibvipsVersionLabelled } = libvips;
const distHost = process.env.npm_config_sharp_libvips_binary_host || 'https://github.com/lovell/sharp-libvips/releases/download';
const distBaseUrl = process.env.npm_config_sharp_dist_base_url || process.env.SHARP_DIST_BASE_URL || `${distHost}/v${minimumLibvipsVersionLabelled}/`;
const installationForced = !!(process.env.npm_config_sharp_install_force || process.env.SHARP_INSTALL_FORCE);

const fail = function (err) {
  console.error(err);
  if (err.code === 'EACCES') {
    console.log('Are you trying to install as a root or sudo user? Try again with the --unsafe-perm flag');
    console.log('Current user:', os.userInfo())
  }
  console.log('Please see https://sharp.pixelplumbing.com/install for required dependencies');
  process.exit(1);
};

const handleError = function (err) {
  if (installationForced) {
    console.log(`Installation warning: ${err.message}`);
  } else {
    throw err;
  }
};

const extractFile = function(targetFolder, file) {
  let tarFile = file.indexOf('.tar') > 0 && file.length > file.indexOf('.tar') + 4
          ? file.slice(0, file.lastIndexOf('.'))
          : null
  // Find all possible ways of being able to extract the file
  return Promise.all([
    utils.runCommand('tar', ['--help']).then(
      () => { return ['tar', ['-xf'], false] },
      () => { return null }
    ),
    utils.runCommand('"C:\\Program Files\\7-Zip\\7z.exe"', ['--help']).then(
      () => { return ['"C:\\Program Files\\7-Zip\\7z.exe"', ['x', '-y'], true] },
      () => { return null }
    ),
    utils.runCommand('7zz', ['--help']).then(
      () => { return ['7zz', ['x', '-y'], true] },
      () => { return null }
    ),
  ])
  .then(results => {
    // Grab the first one
    let item = results.filter(x => Boolean(x))[0]
    if (!item) {
      fail(new Error('could not find a supporting program. Make sure 7zip is installed in windows or that you have 7zz or tar intalled.'))
    }

    return utils.runCommand(
      item[0],
      item[1].slice().concat([file]),
      targetFolder
    ).then(function() {
      // check if third item is true. If so, this is a stupid program that doesn't
      // understand how stupid tar is so we need to extract again.
      if (item[2] && tarFile) {
        return utils.runCommand(
          item[0],
          item[1].slice().concat([tarFile]),
          targetFolder
        )
      }
    })
  })
  .then(function() {
    try {
      fs.unlinkSync(path.join(targetFolder, file))
      if (tarFile) {
        fs.unlinkSync(path.join(targetFolder, tarFile))
      }
    } catch {}
  })
  .catch(fail)
}

const downloadRelease = function() {
  const platformAndArch = platform();
  let url = `https://github.com/lovell/sharp/releases/download/v${packageConfig.config.sharp}/sharp-v${packageConfig.config.sharp}-${packageConfig.config.runtime}-v${packageConfig.config.target}-${platformAndArch}.tar.gz`
  console.log(`Downloading ${url}`)
  let targetFolder = path.join(__dirname, '..')

  utils.request({ }, url, path.join(targetFolder, 'file.tar.gz'))
  .then(function() {

    return extractFile(targetFolder, 'file.tar.gz')
  }, function(err) {
    // Clean up temporary file
    try {
      fs.unlinkSync(path.join(targetFolder, 'file.tar.gz'));
    } catch (e) {}
    fail(err);
  })
}

const extractTarball = function (tarPath, platformAndArch) {
  const versionedVendorPath = path.join(__dirname, '..', 'vendor', minimumLibvipsVersion, platformAndArch);
  libvips.mkdirSync(versionedVendorPath);

  stream.pipeline(
    fs.createReadStream(tarPath),
    new zlib.BrotliDecompress(),
    fs.createWriteStream(path.join(versionedVendorPath, 'file.tar')),
    function (err) {
      if (err) {
        if (/unexpected end of file/.test(err.message)) {
          fail(new Error(`Please delete ${tarPath} as it is not a valid tarball`));
        }
        fail(err);
      }

      extractFile(versionedVendorPath, 'file.tar')
      .then(
        function() {
          downloadRelease()
        }
      )
    }
  );
};

try {
  const useGlobalLibvips = libvips.useGlobalLibvips();
  console.log('Detected platform:', platform())

  if (useGlobalLibvips) {
    const globalLibvipsVersion = libvips.globalLibvipsVersion();
    console.log(`Detected globally-installed libvips v${globalLibvipsVersion}`);
    console.log('Building from source via node-gyp');
    process.exit(1);
  } else if (libvips.hasVendoredLibvips()) {
    console.log(`Using existing vendored libvips v${minimumLibvipsVersion}`);
    downloadRelease()
  } else {
    // Is this arch/platform supported?
    const arch = process.env.npm_config_arch || process.arch;
    const platformAndArch = platform();
    if (arch === 'ia32' && !platformAndArch.startsWith('win32')) {
      throw new Error(`Intel Architecture 32-bit systems require manual installation of libvips >= ${minimumLibvipsVersion}`);
    }
    if (platformAndArch === 'darwin-arm64') {
      throw new Error("Please run 'brew install vips' to install libvips on Apple M1 (ARM64) systems");
    }
    if (platformAndArch === 'freebsd-x64' || platformAndArch === 'openbsd-x64' || platformAndArch === 'sunos-x64') {
      throw new Error(`BSD/SunOS systems require manual installation of libvips >= ${minimumLibvipsVersion}`);
    }
    // Linux libc version check
    if (detectLibc.family === detectLibc.GLIBC && detectLibc.version && minimumGlibcVersionByArch[arch]) {
      if (semverLessThan(`${detectLibc.version}.0`, `${minimumGlibcVersionByArch[arch]}.0`)) {
        handleError(new Error(`Use with glibc ${detectLibc.version} requires manual installation of libvips >= ${minimumLibvipsVersion}`));
      }
    }
    if (detectLibc.family === detectLibc.MUSL && detectLibc.version) {
      if (semverLessThan(detectLibc.version, '1.1.24')) {
        handleError(new Error(`Use with musl ${detectLibc.version} requires manual installation of libvips >= ${minimumLibvipsVersion}`));
      }
    }
    // Node.js minimum version check
    const supportedNodeVersion = process.env.npm_package_engines_node || require('../package.json').engines.node;
    if (!semverSatisfies(process.versions.node, supportedNodeVersion)) {
      handleError(new Error(`Expected Node.js version ${supportedNodeVersion} but found ${process.versions.node}`));
    }

    // Download to per-process temporary file
    const tarFilename = ['libvips', minimumLibvipsVersion, platformAndArch].join('-') + '.tar.br';
    const tarPathCache = path.join(libvips.cachePath(), tarFilename);
    if (fs.existsSync(tarPathCache)) {
      console.log(`Using cached ${tarPathCache}`);
      extractTarball(tarPathCache, platformAndArch);
    } else {
      const url = distBaseUrl + tarFilename;
      const tarPathTemp = path.join(os.tmpdir(), `${process.pid}-${tarFilename}`);
      console.log(`Downloading ${url}`);

      utils.request({ }, url, tarPathTemp)
      .then(function() {
        try {
          // Attempt to rename
          fs.renameSync(tarPathTemp, tarPathCache);
        } catch (err) {
          // Fall back to copy and unlink
          fs.copyFileSync(tarPathTemp, tarPathCache);
          fs.unlinkSync(tarPathTemp);
        }
        extractTarball(tarPathCache, platformAndArch);
      }, function(err) {
        // Clean up temporary file
        try {
          fs.unlinkSync(tarPathTemp);
        } catch (e) {}
        fail(err);
      })
    }
  }
} catch (err) {
  fail(err);
}
