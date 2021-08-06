import RawUserDataValidator, {
  RawUserData,
} from "../../domain/RawUserDataValidator";
import {
  Dependencies,
  EmailAlreadyTaken,
  InvalidCustomerRegisterData,
} from "../interface";

export default async function validateData(
  getUserByEmail: Dependencies["getUserByEmail"],
  userDataValidator: RawUserDataValidator,
  data: RawUserData
) {
  await checkIfEmailIsAlreadyTaken(getUserByEmail, data.email);
  const validationResult = userDataValidator.validateData(data);
  if (!validationResult.isValid)
    throw new InvalidCustomerRegisterData(
      removePropertiesWithNoErrors(validationResult.errorMessages)
    );
  return validationResult.value;
}

async function checkIfEmailIsAlreadyTaken(
  getUserByEmail: Dependencies["getUserByEmail"],
  email: string
) {
  const user = await getUserByEmail(email);
  if (user !== null) throw new EmailAlreadyTaken(email);
}

function removePropertiesWithNoErrors(errorMessages: Record<string, string[]>) {
  const result = {} as any;
  for (const key in errorMessages)
    if (errorMessages[key].length > 0) result[key] = errorMessages[key];
  return result;
}
