import buildPlainUserSchema, { UserData } from "../PlainUserSchema";
import { Schema, ValidationResult } from "../SchemaValidator";

export interface BookAuthorData extends UserData {
  bio: string;
}

export default function buildBookAuthorSchema(
  now: () => Date = () => new Date()
): Schema<BookAuthorData> {
  const baseSchema = buildPlainUserSchema(now);
  return {
    ...baseSchema,
    bio: validateBio,
  };
}

function validateBio(bio: string) {
  bio = bio.trim();
  const res = new ValidationResult("bio", bio);
  if (bio.length > 1000)
    res.addErrorMessage("bio cannot be more than 1000 characters long");
  return res;
}
