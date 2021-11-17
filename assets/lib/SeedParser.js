export class SeedParser {
  static parse(seedData) {
    const lines = seedData.split('\n')

    try {
      let config = null
      let slug = null

      for (const line of lines) {
        if (line.startsWith('// Config: ')) {
          config = JSON.parse(line.substr('// Config: '.length))
        } else if (line.startsWith('// Slug: ')) {
          slug = line.substr('// Slug: '.length)
        }
      }

      if (config === null || slug === null) {
        throw new Error('Could not find config or slug')
      }

      return {
        config,
        slug,
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
