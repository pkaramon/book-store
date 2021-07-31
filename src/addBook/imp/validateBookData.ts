import {
  InvalidBookData,
  CouldNotCompleteRequest,
  IsCorrectEbookFile,
  BookData,
} from "../interface";

export default async function validateBookData(
  data: BookData,
  tools: { now: () => Date; isCorrectEbookFile: IsCorrectEbookFile }
) {
  const validator = new BookDataValidator(
    data,
    tools.now,
    tools.isCorrectEbookFile
  );
  const container = await validator.validate();
  if (container.hasAny())
    throw new InvalidBookData(container.getErrorMessages());
}

class BookDataValidator {
  public container = new ErrorMessagesContainer<BookData>();
  constructor(
    private data: BookData,
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
    return this.container;
  }

  private validateTitle() {
    if (this.data.title.trim().length === 0)
      this.container.add("title", "title cannot be empty");
  }

  private validateDescription() {
    if (this.data.description.trim().length === 0)
      this.container.add("description", "description cannot be empty");
    if (this.data.description.trim().length > 1000)
      this.container.add(
        "description",
        "description cannot be more than 1000 characters long"
      );
  }

  private validatePrice() {
    if (this.data.price <= 0)
      this.container.add("price", "price must be positive");
  }

  private validateNumberOfPages() {
    if (this.data.numberOfPages <= 0)
      this.container.add("numberOfPages", "numberOfPages must be positive");
  }

  private validateWhenCreated() {
    if (this.data.whenCreated.getTime() > this.now().getTime())
      this.container.add(
        "whenCreated",
        "whenCreated cannot be in the future"
      );
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
        this.container.add(pathName, `${pathName} is invalid`);
    } catch {
      throw new CouldNotCompleteRequest();
    }
  }
}

class ErrorMessagesContainer<DataStruct extends Record<string, any>> {
  private errorMessages: Partial<Record<keyof DataStruct, string>> = {};

  add(key: keyof DataStruct, errorMessage: string) {
    this.errorMessages[key] = errorMessage;
  }

  hasAny() {
    return Reflect.ownKeys(this.errorMessages).length > 0;
  }

  getErrorMessages() {
    return this.errorMessages;
  }
}