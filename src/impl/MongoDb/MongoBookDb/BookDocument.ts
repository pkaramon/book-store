export default interface BookDocument {
  _id: string;
  status: "published" | "notPublished";
  authorId: string;
  title: string;
  description: string;
  tableOfContents: TableOfContentsDocumentData;
  price: { currency: string; cents: number };
  whenCreated: Date;
  numberOfPages: number;
  sampleFilePath: string | null;
  filePath: string;
}

export type TableOfContentsDocumentData = Array<{
  title: string;
  children?: TableOfContentsDocumentData;
}>;
