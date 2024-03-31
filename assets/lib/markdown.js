import * as commonmark from 'commonmark'

export function renderMarkdown(markdown) {
  const parser = new commonmark.Parser()
  const writer = new commonmark.HtmlRenderer()
  return writer.render(parser.parse(markdown))
}
