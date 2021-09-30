export class SeedParser {
  static parse(seedData) {
    const lines = seedData.split('\n')
    const lastLine = lines[lines.length - 1]
    const jsonStart = lastLine.indexOf('{')
    try {
      return JSON.parse(lastLine.slice(jsonStart))
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
