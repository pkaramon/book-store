export type TableOfContentsData = Array<{
  title: string;
  children?: TableOfContentsData;
}>;

export default class TableOfContents {
  static NullTableOfContents: TableOfContents = new TableOfContents([]);

  constructor(public readonly data: TableOfContentsData) {}
}
