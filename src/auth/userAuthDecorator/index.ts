import VerifyToken from "../VerifyToken";

export default function userAuthDecorator<
  U extends Usecase<any, any>,
  IdPropertyName extends string,
  TokenPropertyName extends string
>(
  fn: U,
  auth: {
    verifyToken: VerifyToken;
    idPropertyName: IdPropertyName;
    tokenPropertyName: TokenPropertyName;
  }
) {
  return async function (
    data: Record<TokenPropertyName, string> &
      Omit<InputDataFromUsecase<U>, IdPropertyName>
  ) {
    const { verifyToken, tokenPropertyName, idPropertyName } = auth;
    const id = await verifyToken(data[tokenPropertyName]);
    return fn({ ...data, [idPropertyName]: id } as any);
  };
}

interface Usecase<D extends Record<string, any>, R> {
  (data: D): R;
}

type InputDataFromUsecase<U extends Usecase<any, any>> = U extends Usecase<
  infer D,
  any
>
  ? D
  : never;
