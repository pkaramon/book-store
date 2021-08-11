import {
  CouldNotCompleteRequest,
  InvalidUserType,
  UserNotFound,
} from "../CartRelatedAction";

export interface RemoveFromCart {
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

export class BookNotInCart extends Error {
  constructor(public bookId: string) {
    super(`book with id :${bookId} does not exist in th`);
  }
}

export { CouldNotCompleteRequest, UserNotFound, InvalidUserType };
