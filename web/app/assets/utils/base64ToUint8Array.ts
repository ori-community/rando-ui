export function base64ToUint8Array(base64: string): Uint8Array {
  const decodedBinaryString = atob(base64)
  const byteArray = new Array(decodedBinaryString.length)
  for (let i = 0; i < decodedBinaryString.length; i++) {
    byteArray[i] = decodedBinaryString.charCodeAt(i)
  }

  return Uint8Array.from(byteArray)
}
