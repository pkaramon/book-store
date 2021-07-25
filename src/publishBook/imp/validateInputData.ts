import {
  InputData,
  InvalidBookData,
  CouldNotCompleteRequest,
  IsCorrectEbookFile,
  InvalidBookDataErrors,
} from "../interface";

export default async function validateInputData(
  data: InputData,
  tools: { now: () => Date; isCorrectEbookFile: IsCorrectEbookFile }
) {
  const validator = new BookDataValidator(
    data,
    tools.now,
    tools.isCorrectEbookFile
  );
  const errors = await validator.validate();
  if (Reflect.ownKeys(errors).length > 0) throw new InvalidBookData(errors);
}

class BookDataValidator {
  public errors: InvalidBookDataErrors = {};

  constructor(
    private data: InputData,
    private now: () => Date,
    private isCorrectEbookFile: IsCorrectEbookFile
  ) {}

  async validate() {
    this.validateTitle();
    this.validateDescription();
    this.validatePrice();
    this.validateNumberOfPages();
    this.validateWhenCreated();
    await this.validateSampleFilePath();
    await this.validateFilePath();
    return this.errors;
  }

  private validateTitle() {
    if (this.data.title.trim().length === 0)
      this.errors.title = "title cannot be empty";
  }

  private validateDescription() {
    if (this.data.description.trim().length === 0)
      this.errors.description = "description cannot be empty";
    if (this.data.description.trim().length > 1000)
      this.errors.description =
        "description cannot be more than 1000 characters long";
  }

  private validatePrice() {
    if (this.data.price <= 0) this.errors.price = "price must be positive";
  }

  private validateNumberOfPages() {
    if (this.data.numberOfPages <= 0)
      this.errors.numberOfPages = "numberOfPages must be positive";
  }

  private validateWhenCreated() {
    if (this.data.whenCreated.getTime() > this.now().getTime())
      this.errors.whenCreated = "whenCreated cannot be in the future";
  }

  private async validateSampleFilePath() {
    await this.validateBookFilePath("sampleFilePath");
  }

  private async validateFilePath() {
    await this.validateBookFilePath("filePath");
  }

  private async validateBookFilePath(pathName: "sampleFilePath" | "filePath") {
    try {
      const path = this.data[pathName];
      if (path !== undefined && !(await this.isCorrectEbookFile(path)))
        this.errors[pathName] = `${pathName} is invalid`;
    } catch {
      throw new CouldNotCompleteRequest();
    }
  }
}
