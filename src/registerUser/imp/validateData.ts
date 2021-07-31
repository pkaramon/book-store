import UserDataValidator from "../../domain/User/UserDataValidator";
import { Dependencies, InputData, InvalidUserRegisterData } from "../interface";

export default async function validateData(
  getUserByEmail: Dependencies["getUserByEmail"],
  userDataValidator: UserDataValidator,
  data: InputData
) {
  const result = userDataValidator.validateUserData(data);
  const u = await getUserByEmail(data.email);
  if (u !== null) {
    result.errorMessages.email.push("email is already taken");
    result.isValid = false;
  }

  if (!result.isValid)
    throw new InvalidUserRegisterData(
      removePropertiesWithNoErrors(result.errorMessages)
    );
  return result.value;
}

function removePropertiesWithNoErrors(errorMessages: Record<string, string[]>) {
  const result = {} as any;
  for (const key in errorMessages)
    if (errorMessages[key].length > 0) result[key] = errorMessages[key];
  return result;
}
