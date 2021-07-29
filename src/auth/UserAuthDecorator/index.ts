import VerifyToken from "../VerifyToken";

export default function buildUserAuthDecorator(verifyToken: VerifyToken) {
  return function UserAuthDecorator<D extends Record<string, any>, R>(
    fn: Usecase<D, R>
  ) {
    return function (data: UserAuthDecoratorData<D>) {
      const userId = verifyToken(data.token);
      return fn({ ...data, userId } as any);
    };
  };
}

interface Usecase<D extends Record<string, any>, R> {
  (data: D): R;
}

type UserAuthDecoratorData<OriginalData extends Record<string, any>> = {
  token: string;
} & Omit<OriginalData, "userId">;
