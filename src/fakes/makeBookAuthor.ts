import BookAuthor from "../domain/BookAuthor";
import MakeBookAuthor from "../domain/BookAuthor/MakeBookAuthor";

const makeBookAuthor: MakeBookAuthor = (data) => {
  return new BookAuthor({
    ...data,
    id: data.id ?? Math.random().toString(),
  });
};
export default makeBookAuthor;
