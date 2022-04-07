# sharp-lite

Sharp-lite is a none-gyp included version of sharp that instead only contains the actual javascript portion and avoids using the bloated prebuild-install dependency.
**Note:** That means that it requires a build version included for your running OS, see them here: https://github.com/lovell/sharp/releases

Because of that, the dependency tree becomes a lot lighter:

```
sharp-lite@0.29.3.0
+-- color@4.0.1
| +-- color-convert@2.0.1
| | `-- color-name@1.1.4
| `-- color-string@1.6.0
|   +-- color-name@1.1.4 deduped
|   `-- simple-swizzle@0.2.2
|     `-- is-arrayish@0.3.2
+-- detect-libc@1.0.3
`-- semver@7.3.5
  `-- lru-cache@6.0.0
    `-- yallist@4.0.0
```

not to mention the license list:

```
> license-checker --production --summary --onlyAllow="Apache-2.0;BSD;ISC;MIT"

├─ MIT: 6
├─ ISC: 3
└─ Apache-2.0: 2
```

as opposed to:

```
sharp@0.29.3
+-- color@4.0.1
| +-- color-convert@2.0.1
| | `-- color-name@1.1.4
| `-- color-string@1.6.0
|   +-- color-name@1.1.4 deduped
|   `-- simple-swizzle@0.2.2
|     `-- is-arrayish@0.3.2
+-- detect-libc@1.0.3
+-- node-addon-api@4.2.0
+-- prebuild-install@7.0.0
| +-- detect-libc@1.0.3 deduped
| +-- expand-template@2.0.3
| +-- github-from-package@0.0.0
| +-- minimist@1.2.5
| +-- mkdirp-classic@0.5.3
| +-- napi-build-utils@1.0.2
| +-- node-abi@3.5.0
| | `-- semver@7.3.5 deduped
| +-- npmlog@4.1.2
| | +-- are-we-there-yet@1.1.7
| | | +-- delegates@1.0.0
| | | `-- readable-stream@2.3.7
| | |   +-- core-util-is@1.0.3
| | |   +-- inherits@2.0.4 deduped
| | |   +-- isarray@1.0.0
| | |   +-- process-nextick-args@2.0.1
| | |   +-- safe-buffer@5.1.2 deduped
| | |   +-- string_decoder@1.1.1 deduped
| | |   `-- util-deprecate@1.0.2 deduped
| | +-- console-control-strings@1.1.0
| | +-- gauge@2.7.4
| | | +-- aproba@1.2.0
| | | +-- console-control-strings@1.1.0 deduped
| | | +-- has-unicode@2.0.1
| | | +-- object-assign@4.1.1
| | | +-- signal-exit@3.0.6
| | | +-- string-width@1.0.2
| | | | +-- code-point-at@1.1.0
| | | | +-- is-fullwidth-code-point@1.0.0
| | | | | `-- number-is-nan@1.0.1
| | | | `-- strip-ansi@3.0.1 deduped
| | | +-- strip-ansi@3.0.1
| | | | `-- ansi-regex@2.1.1
| | | `-- wide-align@1.1.5
| | |   `-- string-width@1.0.2 deduped
| | `-- set-blocking@2.0.0
| +-- pump@3.0.0
| | +-- end-of-stream@1.4.4
| | | `-- once@1.4.0 deduped
| | `-- once@1.4.0 deduped
| +-- rc@1.2.8
| | +-- deep-extend@0.6.0
| | +-- ini@1.3.8
| | +-- minimist@1.2.5 deduped
| | `-- strip-json-comments@2.0.1
| +-- simple-get@4.0.0 deduped
| +-- tar-fs@2.1.1 deduped
| `-- tunnel-agent@0.6.0 deduped
+-- semver@7.3.5
| `-- lru-cache@6.0.0
|   `-- yallist@4.0.0
+-- simple-get@4.0.0
| +-- decompress-response@6.0.0
| | `-- mimic-response@3.1.0
| +-- once@1.4.0
| | `-- wrappy@1.0.2
| `-- simple-concat@1.0.1
+-- tar-fs@2.1.1
| +-- chownr@1.1.4
| +-- mkdirp-classic@0.5.3 deduped
| +-- pump@3.0.0 deduped
| `-- tar-stream@2.2.0
|   +-- bl@4.1.0
|   | +-- buffer@5.7.1
|   | | +-- base64-js@1.5.1
|   | | `-- ieee754@1.2.1
|   | +-- inherits@2.0.4 deduped
|   | `-- readable-stream@3.6.0
|   |   +-- inherits@2.0.4 deduped
|   |   +-- string_decoder@1.1.1 deduped
|   |   `-- util-deprecate@1.0.2 deduped
|   +-- end-of-stream@1.4.4 deduped
|   +-- fs-constants@1.0.0
|   +-- inherits@2.0.4
|   `-- readable-stream@3.6.0
|     +-- inherits@2.0.4 deduped
|     +-- string_decoder@1.1.1
|     | `-- safe-buffer@5.1.2 deduped
|     `-- util-deprecate@1.0.2
`-- tunnel-agent@0.6.0
  `-- safe-buffer@5.1.2
```

with

```
├─ MIT: 45
├─ ISC: 17
├─ Apache-2.0: 3
├─ (MIT OR WTFPL): 1
├─ BSD-3-Clause: 1
└─ (BSD-2-Clause OR MIT OR Apache-2.0): 1
```

# sharp

<img src="https://cdn.jsdelivr.net/gh/lovell/sharp@main/docs/image/sharp-logo.svg" width="160" height="160" alt="sharp logo" align="right">

The typical use case for this high speed Node.js module
is to convert large images in common formats to
smaller, web-friendly JPEG, PNG, WebP, GIF and AVIF images of varying dimensions.

Resizing an image is typically 4x-5x faster than using the
quickest ImageMagick and GraphicsMagick settings
due to its use of [libvips](https://github.com/libvips/libvips).

Colour spaces, embedded ICC profiles and alpha transparency channels are all handled correctly.
Lanczos resampling ensures quality is not sacrificed for speed.

As well as image resizing, operations such as
rotation, extraction, compositing and gamma correction are available.

Most modern macOS, Windows and Linux systems running Node.js >= 12.13.0
do not require any additional install or runtime dependencies.

## Documentation

Visit [sharp.pixelplumbing.com](https://sharp.pixelplumbing.com/) for complete
[installation instructions](https://sharp.pixelplumbing.com/install),
[API documentation](https://sharp.pixelplumbing.com/api-constructor),
[benchmark tests](https://sharp.pixelplumbing.com/performance) and
[changelog](https://sharp.pixelplumbing.com/changelog).

## Examples

```sh
npm install sharp
```

```javascript
const sharp = require('sharp');
```

### Callback

```javascript
sharp(inputBuffer)
  .resize(320, 240)
  .toFile('output.webp', (err, info) => { ... });
```

### Promise

```javascript
sharp('input.jpg')
  .rotate()
  .resize(200)
  .jpeg({ mozjpeg: true })
  .toBuffer()
  .then( data => { ... })
  .catch( err => { ... });
```

### Async/await

```javascript
const semiTransparentRedPng = await sharp({
  create: {
    width: 48,
    height: 48,
    channels: 4,
    background: { r: 255, g: 0, b: 0, alpha: 0.5 }
  }
})
  .png()
  .toBuffer();
```

### Stream

```javascript
const roundedCorners = Buffer.from(
  '<svg><rect x="0" y="0" width="200" height="200" rx="50" ry="50"/></svg>'
);

const roundedCornerResizer =
  sharp()
    .resize(200, 200)
    .composite([{
      input: roundedCorners,
      blend: 'dest-in'
    }])
    .png();

readableStream
  .pipe(roundedCornerResizer)
  .pipe(writableStream);
```

## Contributing

A [guide for contributors](https://github.com/lovell/sharp/blob/main/.github/CONTRIBUTING.md)
covers reporting bugs, requesting features and submitting code changes.

[![Test Coverage](https://coveralls.io/repos/lovell/sharp/badge.svg?branch=main)](https://coveralls.io/r/lovell/sharp?branch=main)
[![Node-API v5](https://img.shields.io/badge/Node--API-v5-green.svg)](https://nodejs.org/dist/latest/docs/api/n-api.html#n_api_n_api_version_matrix)

## Licensing

Copyright 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022 Lovell Fuller and contributors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
[https://www.apache.org/licenses/LICENSE-2.0](https://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
