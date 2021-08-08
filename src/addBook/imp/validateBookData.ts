import ErrorMessagesContainer from "../../utils/ErrorMessagesContainer";
import {
  InvalidBookData,
  CouldNotCompleteRequest,
  IsCorrectEbookFile,
  BookData,
} from "../interface";

export default function validateBookData(
  data: BookData,
  tools: { now: () => Date; isCorrectEbookFile: IsCorrectEbookFile }
) {
  const validator = new BookDataValidator(
    data,
    tools.now,
    tools.isCorrectEbookFile
  );
  return validator.validate();
}

class BookDataValidator {
  public container = new ErrorMessagesContainer<BookData>();
  constructor(
    private data: BookData,
    private now: () => Date,
    private isCorrectEbookFile: IsCorrectEbookFile
  ) {}

  async validate(): Promise<BookData> {
    const title = this.validateTitle();
    const description = this.validateDescription();
    const price = this.validatePrice();
    const numberOfPages = this.validateNumberOfPages();
    const whenCreated = this.validateWhenCreated();
    const sampleFilePath = await this.validateSampleFilePath();
    const filePath = await this.validateFilePath();
    if (this.container.hasAny())
      throw new InvalidBookData(this.container.getErrorMessages());
    return {
      title,
      description,
      price,
      numberOfPages,
      whenCreated,
      sampleFilePath,
      filePath: filePath!,
      tableOfContents: this.data.tableOfContents,
    };
  }

  private validateTitle() {
    const title = this.data.title.trim();
    if (title.trim().length === 0)
      this.container.add("title", "title cannot be empty");
    return title;
  }

  private validateDescription() {
    const desc = this.data.description.trim();
    if (desc.length === 0)
      this.container.add("description", "description cannot be empty");
    if (desc.length > 1000)
      this.container.add(
        "description",
        "description cannot be more than 1000 characters long"
      );
    return desc;
  }

  private validatePrice() {
    const currency = this.data.price.currency.trim();
    const cents = this.data.price.cents;
    if (cents <= 0) this.container.add("price", "price.cents must be positive");
    if (!Number.isSafeInteger(cents))
      this.container.add("price", "price.cents must be an integer");
    if (currency !== "USD")
      this.container.add("price", "price.currency can be USD only");
    return { currency, cents };
  }

  private validateNumberOfPages() {
    const { numberOfPages } = this.data;
    if (numberOfPages <= 0)
      this.container.add("numberOfPages", "numberOfPages must be positive");
    return numberOfPages;
  }

  private validateWhenCreated() {
    const { whenCreated } = this.data;
    if (whenCreated.getTime() > this.now().getTime())
      this.container.add("whenCreated", "whenCreated cannot be in the future");
    return whenCreated;
  }

  private async validateSampleFilePath() {
    return await this.validateBookFilePath("sampleFilePath");
  }

  private async validateFilePath() {
    return await this.validateBookFilePath("filePath");
  }

  private async validateBookFilePath(pathName: "sampleFilePath" | "filePath") {
    try {
      const path = this.data[pathName];
      if (path !== undefined && !(await this.isCorrectEbookFile(path.trim()))) {
        this.container.add(pathName, `${pathName} is invalid`);
      }

      if (path === undefined) return path;
      else return path.trim();
    } catch {
      throw new CouldNotCompleteRequest();
    }
  }
}
