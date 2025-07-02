import Showdown from 'showdown';

export function mdToHtml(mdContent: string): string {
  var converter = new Showdown.Converter();

  converter.setOption('tables', true);
  converter.setOption('tasklists', true);
  converter.setOption('strikethrough', true);
  converter.setOption('underline', true);
  converter.setOption('footnotes', true);
  converter.setOption('smartLists', true);
  converter.setOption('smartypants', true);
  converter.setOption('openLinksInNewWindow', true);

  return converter.makeHtml(mdContent);
}
