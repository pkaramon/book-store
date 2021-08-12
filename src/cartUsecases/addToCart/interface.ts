import {
  CouldNotCompleteRequest,
  InvalidUserType,
  UserNotFound,
} from "../CartRelatedAction";

export default interface AddToCart {
  (data: InputData): Promise<Response>;
}

export interface InputData {
  userAuthToken: string;
  bookId: string;
}

export interface Response {
  cartItems: CartItemOutput[];
}

export interface CartItemOutput {
  bookId: string;
  title: string;
  price: {
    currency: string;
    cents: number;
  };
  author: {
    firstName: string;
    lastName: string;
  };
}

export class BookNotFound extends Error {
  constructor(public readonly bookId: string) {
    super();
    this.name = BookNotFound.name;
  }
}

export class BookWasNotPublished extends Error {
  constructor(public readonly bookId: string) {
    super();
    this.name = BookWasNotPublished.name;
  }
}

export { UserNotFound, InvalidUserType, CouldNotCompleteRequest };
