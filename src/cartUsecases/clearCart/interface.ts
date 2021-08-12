import CartItemOutput from "../CartItemOutput";
import {
  CouldNotCompleteRequest,
  InvalidUserType,
  UserNotFound,
} from "../CartRelatedAction";

export interface ClearCart {
  (data: InputData): Promise<Response>;
}

export interface InputData {
  userAuthToken: string;
}

export interface Response {
  cartItems: CartItemOutput[];
}

export { CouldNotCompleteRequest, UserNotFound, InvalidUserType };
