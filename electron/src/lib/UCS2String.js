import ffi from '@lwahonen/ffi-napi'
import ref from '@lwahonen/ref-napi'

export const UCS2String = {
  name: 'lpctstr',
  indirection: 1,
  size: ref.sizeof.pointer,
  get: function(buffer, offset) {
    const _buf = buffer.readPointer(offset)
    if (_buf.isNull()) {
      return null
    }
    return _buf.readCString(0)
  },
  set: function(buffer, offset, value) {
    const _buf = Buffer.alloc(Buffer.byteLength(value, 'ucs2') + 2)
    _buf.write(value, 'ucs2')
    _buf[_buf.length - 2] = 0
    _buf[_buf.length - 1] = 0
    return buffer.writePointer(_buf, offset)
  },
  ffi_type: ffi.types.CString.ffi_type,
}
