
const http = require('http')
const https = require('https')
const fs = require('fs')
const url = require('url')
const child_process = require('child_process')

function runCommand(command, options = [], folder = null, stream = function() {}) {
  return new Promise(function(res, rej) {
    stream(`[Command] ${folder ? folder : ''}${command} ${options.join(' ')}\n`)
    let processor = child_process.spawn(command, options, {
      shell: true,
      cwd: folder,
    })
    let timeOuter = setTimeout(function() {
      processor.stdin.write('n\n')
    }, 250)
    processor.stdout.on('data', function(data) {
      stream(data.toString())
    })
    processor.stderr.on('data', function(data) {
      stream(data.toString())
    })
    processor.on('error', function(err) {
      clearInterval(timeOuter)
      rej(err)
    })
    processor.on('exit', function (code) {
      clearInterval(timeOuter)
      if (code !== 0) {
        return rej(new Error('Program returned error code: ' + code))
      }
      res(code)
    })
  })
}


function request(config, path, filePath = null, redirects, returnText = false) {
  if (!config || typeof(config) === 'string') {
    return Promise.reject(new Error('Request must be called with config in first parameter'))
  }
  let newRedirects = redirects + 1
  if (!path || !path.startsWith('http')) {
    return Promise.reject(new Error('URL was empty or missing http in front'))
  }
  let parsed = new url.URL(path)

  let h
  if (parsed.protocol === 'https:') {
    h = https
  } else {
    h = http
  }

  return new Promise(function(resolve, reject) {
    if (!path) {
      return reject(new Error('Request path was empty'))
    }
    let headers = {
      'User-Agent': 'TheThing/service-core',
      Accept: 'application/vnd.github.v3+json'
    }
    if (config.githubAuthToken && path.indexOf('api.github.com') >= 0) {
      headers['Authorization'] = `token ${config.githubAuthToken}`
    }
    let req = h.request({
      path: parsed.pathname + parsed.search,
      port: parsed.port,
      method: 'GET',
      headers: headers,
      timeout: returnText ? 5000 : 10000,
      hostname: parsed.hostname
    }, function(res) {
      let output = ''
      if (filePath) {
        let file = fs.createWriteStream(filePath)
        res.pipe(file)
      } else {
        res.on('data', function(chunk) {
          output += chunk
        })
      }
      res.on('end', function() {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          if (newRedirects > 5) {
            return reject(new Error(`Too many redirects (last one was ${res.headers.location})`))
          }
          if (!res.headers.location) {
            return reject(new Error('Redirect returned no path in location header'))
          }
          if (res.headers.location.startsWith('http')) {
            return resolve(request(config, res.headers.location, filePath, newRedirects, returnText))
          } else {
            return resolve(request(config, url.resolve(path, res.headers.location), filePath, newRedirects, returnText))
          }
        } else if (res.statusCode >= 400) {
          return reject(new Error(`HTTP Error ${res.statusCode}: ${output}`))
        }
        resolve({
          statusCode: res.statusCode,
          status: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: output
        })
      })
      req.on('error', reject)
      req.on('timeout', function(err) {
        reject(err)
      })
    })
    req.end()
  }).then(function(res) {
    if (!filePath && !returnText) {
      try {
        res.body = JSON.parse(res.body)
      } catch(e) {
        throw new Error(res.body)
      }
    }
    return res
  })
}

module.exports = {
  runCommand: runCommand,
  request: request,
}
