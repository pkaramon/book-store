export default interface DeleteBook {
  (data: InputData): Promise<void>;
}

export interface InputData {
  userAuthToken: string;
  bookId: string;
}

export class BookNotFound extends Error {
  constructor(public readonly bookId: string) {
    super(`book with id: ${bookId} was not found`);
    this.name = BookNotFound.name;
  }
}

export class NotAllowed extends Error {
  constructor(public readonly userId: string, public readonly bookId: string) {
    super(`user with id: ${userId} is not the author of the book`);
    this.name = BookNotFound.name;
  }
}

export class CouldNotCompleteRequest extends Error {
  constructor(reason: string, public readonly originalError: any) {
    super(reason);
    this.name = CouldNotCompleteRequest.name;
  }
}
