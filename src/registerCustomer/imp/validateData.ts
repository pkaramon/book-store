import RawUserDataValidator, {
  RawUserData,
} from "../../domain/RawUserDataValidator";
import { Dependencies, InvalidCustomerRegisterData } from "../interface";

export default async function validateData(
  getUserByEmail: Dependencies["getUserByEmail"],
  userDataValidator: RawUserDataValidator,
  data: RawUserData
) {
  const result = userDataValidator.validateData(data);
  const u = await getUserByEmail(data.email);
  if (u !== null) {
    result.errorMessages.email.push("email is already taken");
    result.isValid = false;
  }

  if (!result.isValid)
    throw new InvalidCustomerRegisterData(
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
