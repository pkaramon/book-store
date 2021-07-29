export type TableOfContentsData = Array<{
  title: string;
  children?: TableOfContentsData;
}>;

export default class TableOfContents {
  static EmptyTableOfContents: TableOfContents = new TableOfContents([]);

  constructor(public readonly data: TableOfContentsData) {}
}
