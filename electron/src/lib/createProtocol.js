/**
 * This is copied from vue-cli-plugin-electron-builder with added wasm support
 */

/*
  Slightly modified from:

  Reasonably Secure Electron
  Copyright (C) 2019  Bishop Fox
  This program is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation; either version 2
  of the License, or (at your option) any later version.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
-------------------------------------------------------------------------
Implementing a custom protocol achieves two goals:
  1) Allows us to use ES6 modules/targets for Angular
  2) Avoids running the app in a file:// origin
*/

import { protocol } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { URL } from 'url'

const mimeTypes = {
  '.aac': 'audio/aac',
  '.abw': 'application/x-abiword',
  '.arc': 'application/x-freearc',
  '.avi': 'video/x-msvideo',
  '.azw': 'application/vnd.amazon.ebook',
  '.bin': 'application/octet-stream',
  '.bmp': 'image/bmp',
  '.bz': 'application/x-bzip',
  '.bz2': 'application/x-bzip2',
  '.cda': 'application/x-cdf',
  '.csh': 'application/x-csh',
  '.css': 'text/css',
  '.csv': 'text/csv',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.eot': 'application/vnd.ms-fontobject',
  '.epub': 'application/epub+zip',
  '.gz': 'application/gzip',
  '.gif': 'image/gif',
  '.htm': 'text/html',
  '.html': 'text/html',
  '.ico': 'image/vnd.microsoft.icon',
  '.ics': 'text/calendar',
  '.jar': 'application/java-archive',
  '.jpeg': '.jpg:image/jpeg',
  '.jpg': '.jpg:image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.jsonld': 'application/ld+json',
  '.mid': '.midi:audio/midi',
  '.midi': '.midi:audio/midi',
  '.mjs': 'text/javascript',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.mpeg': 'video/mpeg',
  '.mpkg': 'application/vnd.apple.installer+xml',
  '.odp': 'application/vnd.oasis.opendocument.presentation',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.oga': 'audio/ogg',
  '.ogv': 'video/ogg',
  '.ogx': 'application/ogg',
  '.opus': 'audio/opus',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.php': 'application/x-httpd-php',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.rar': 'application/vnd.rar',
  '.rtf': 'application/rtf',
  '.sh': 'application/x-sh',
  '.svg': 'image/svg+xml',
  '.swf': 'application/x-shockwave-flash',
  '.tar': 'application/x-tar',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.ts': 'video/mp2t',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
  '.vsd': 'application/vnd.visio',
  '.wav': 'audio/wav',
  '.wasm': 'application/wasm',
  '.weba': 'audio/webm',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xhtml': 'application/xhtml+xml',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xml': 'application/xml',
  '.xul': 'application/vnd.mozilla.xul+xml',
  '.zip': 'application/zip',
  '.7z': 'application/x-7z-compressed',
}

function charset(mimeType) {
  return ['.html', '.htm', '.js', '.mjs'].some((m) => m === mimeType) ? 'utf-8' : null
}

function mime(filename) {
  return mimeTypes[path.extname(`${filename || ''}`).toLowerCase()]
}

export const createProtocol = (scheme, customProtocol) =>
  (customProtocol || protocol).registerBufferProtocol(scheme, (req, next) => {
    const reqUrl = new URL(req.url)

    // If the path doesn't start with "/" then path.normalize will not
    // resolve all '..' and could lead to path traversal attacks
    if (!reqUrl.pathname.startsWith('/')) {
      return next({
        mimeType: null,
        charset: null,
        data: null,
      })
    }

    let reqPath = path.normalize(reqUrl.pathname)
    if (reqPath === '/') {
      reqPath = '/index.html'
    }

    const reqFilename = path.basename(reqPath)
    fs.readFile(path.join(__dirname, reqPath), (err, data) => {
      const mimeType = mime(reqFilename)
      if (!err) {
        next({
          mimeType: mimeType,
          charset: charset(mimeType),
          data: data,
        })
      } else {
        console.error(err)
        next({
          mimeType: null,
          charset: null,
          data: null,
        })
      }
    })
  })
