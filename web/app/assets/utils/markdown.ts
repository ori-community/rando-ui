import * as commonmark from "commonmark"

export const renderMarkdown = ((markdown: string): string => {
  const parser = new commonmark.Parser()
  const writer = new commonmark.HtmlRenderer()
  return writer.render(parser.parse(markdown))
})
