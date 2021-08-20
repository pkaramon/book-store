import { AsyncSchema } from "../AsyncSchemaValidator";
import Clock from "../Clock";
import { ValidationResult } from "../SchemaValidator";
import { TableOfContentsData } from "./TableOfContents";

export interface BookData {
  title: string;
  description: string;
  tableOfContents?: TableOfContentsData;
  price: { currency: string; cents: number };
  whenCreated: Date;
  numberOfPages: number;
  sampleFilePath?: string;
  filePath: string;
}

export interface Tools {
  isCorrectEbookFile: IsCorrectEbookFile;
  clock: Clock;
}

export interface IsCorrectEbookFile {
  (path: string): Promise<boolean>;
}

export default function buildBookSchema({
  isCorrectEbookFile,
  clock,
}: Tools): AsyncSchema<BookData> {
  return {
    title: validateTitle,
    description: validateDescription,
    price: validatePrice,
    filePath: (v) => validateFilePath(isCorrectEbookFile, v),
    sampleFilePath: (v) => validateSampleFilePath(isCorrectEbookFile, v),
    numberOfPages: validateNumberOfPages,
    whenCreated: (v) => validateWhenCreated(clock, v),
    tableOfContents: (v) => noop("tableOfContents", v),
  };
}

function noop<Key extends string>(key: Key, value: any) {
  return new ValidationResult(key, value);
}

function validateTitle(title: string) {
  title = title.trim();
  const res = new ValidationResult("title", title);
  if (title.trim().length === 0) res.addErrorMessage("title cannot be empty");
  return res;
}

function validateDescription(description: string) {
  description = description.trim();
  const res = new ValidationResult("description", description);
  if (description.length === 0)
    res.addErrorMessage("description cannot be empty");
  if (description.length > 1000)
    res.addErrorMessage("description cannot be more than 1000 characters long");
  return res;
}

function validatePrice(price: { currency: string; cents: number }) {
  const currency = price.currency.trim();
  const cents = price.cents;
  const res = new ValidationResult("price", { currency, cents });
  if (cents <= 0) res.addErrorMessage("price.cents must be positive");
  if (!Number.isSafeInteger(cents))
    res.addErrorMessage("price.cents must be an integer");
  if (currency !== "USD") res.addErrorMessage("price.currency can be USD only");
  return res;
}

function validateNumberOfPages(numberOfPages: number) {
  const res = new ValidationResult("numberOfPages", numberOfPages);
  if (numberOfPages <= 0) res.addErrorMessage("numberOfPages must be positive");
  return res;
}

function validateWhenCreated(clock: Clock, whenCreated: Date) {
  const res = new ValidationResult("whenCreated", whenCreated);
  if (whenCreated.getTime() > clock.now().getTime())
    res.addErrorMessage("whenCreated cannot be in the future");
  return res;
}

async function validateSampleFilePath(
  isCorrectEbookFile: IsCorrectEbookFile,
  sampleFilePath: string | undefined
) {
  if (sampleFilePath === undefined)
    return new ValidationResult("sampleFilePath", undefined);
  const res = new ValidationResult("sampleFilePath", sampleFilePath);
  return await validateBookFilePath(isCorrectEbookFile, res);
}

async function validateFilePath(
  isCorrectEbookFile: IsCorrectEbookFile,
  filePath: string
) {
  const res = new ValidationResult("filePath", filePath.trim());
  return await validateBookFilePath(isCorrectEbookFile, res);
}

async function validateBookFilePath<Key extends string>(
  isCorrectEbookFile: IsCorrectEbookFile,
  res: ValidationResult<Key, string>
) {
  if (!(await isCorrectEbookFile(res.value))) {
    res.addErrorMessage(`${res.key} is invalid`);
  }
  return res;
}
