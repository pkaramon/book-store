export default interface Search {
  (query: string): Promise<{ books: BookOutput[] }>;
}

export interface BookOutput {
  id: string;
  title: string;
  price: { currency: string; cents: number };
  description: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  numberOfPages: number;
}

export class CouldNotCompleteRequest extends Error {
  constructor(message: string, public originalError: Error) {
    super(message);
    this.name = CouldNotCompleteRequest.name;
  }
}
