import {
  InputData,
  ValidationError,
  CouldNotCompleteRequest,
  Dependencies,
  Clock,
  IsCorrectEbookFile,
} from "../interface";

export default async function validateInputData(
  deps: Dependencies,
  data: InputData
) {
  const errors: Record<string, string> = {};
  validateTitle(data.title, errors);
  validateDescription(data.description, errors);
  validatePrice(data.price, errors);
  validateNumberOfPages(data.numberOfPages, errors);
  validateWhenCreated(deps.clock, data.whenCreated, errors);
  await validateBookFilePath(
    deps.isCorrectEbookFile,
    "sampleFilePath",
    data.sampleFilePath,
    errors
  );
  await validateBookFilePath(
    deps.isCorrectEbookFile,
    "filePath",
    data.filePath,
    errors
  );
  if (Reflect.ownKeys(errors).length > 0) throw new ValidationError(errors);
}

function validateTitle(title: string, errors: Record<string, string>) {
  if (title.trim().length === 0) errors.title = "title cannot be empty";
}

function validateDescription(
  description: string,
  errors: Record<string, string>
) {
  if (description.trim().length === 0)
    errors.description = "description cannot be empty";
  if (description.trim().length > 1000)
    errors.description = "description cannot be more than 1000 characters long";
}

function validatePrice(price: number, errors: Record<string, string>) {
  if (price <= 0) errors.price = "price must be positive";
}

function validateNumberOfPages(
  numberOfPages: number,
  errors: Record<string, string>
) {
  if (numberOfPages <= 0)
    errors.numberOfPages = "numberOfPages must be positive";
}

function validateWhenCreated(
  clock: Clock,
  whenCreated: Date,
  errors: Record<string, string>
) {
  if (whenCreated.getTime() > clock.now().getTime())
    errors.whenCreated = "whenCreated cannot be in the future";
}

async function validateBookFilePath(
  isCorrectEbookFile: IsCorrectEbookFile,
  pathName: string,
  path: string | undefined,
  errors: Record<string, string>
) {
  try {
    if (path !== undefined && !(await isCorrectEbookFile(path)))
      errors[pathName] = `${pathName} is invalid`;
  } catch {
    throw new CouldNotCompleteRequest();
  }
}
