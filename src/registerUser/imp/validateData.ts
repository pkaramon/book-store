import UserDataValidator from "../../domain/User/UserDataValidator";
import { InputData, InvalidUserRegisterData } from "../interface";

export default function validateData(
  userDataValidator: UserDataValidator,
  data: InputData
) {
  const result = userDataValidator.validateUserData(data);
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
