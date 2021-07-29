import TableOfContents from "./TableOfContents";

export enum BookStatus {
  published,
  notPublished,
}

export default class Book {
  private data = {
    ...this.incomingData,
    status: BookStatus.notPublished,
  };

  constructor(
    private incomingData: {
      id: string;
      authorId: string;
      title: string;
      description: string;
      tableOfContents: TableOfContents;
      price: number;
      whenCreated: Date;
      numberOfPages: number;
      sampleFilePath: string | null;
      filePath: string;
    }
  ) {}

  get id() {
    return this.data.id;
  }

  get authorId() {
    return this.data.authorId;
  }

  get title() {
    return this.data.title;
  }

  get description() {
    return this.data.description;
  }

  get tableOfContents() {
    return this.data.tableOfContents;
  }

  get price() {
    return this.data.price;
  }

  get whenCreated() {
    return this.data.whenCreated;
  }

  get numberOfPages() {
    return this.data.numberOfPages;
  }

  get status() {
    return this.data.status;
  }

  publish() {
    this.data.status = BookStatus.published;
  }

  get filePath() {
    return this.data.filePath;
  }

  get sampleFilePath() {
    return this.data.sampleFilePath;
  }
}
