export default interface CartItemOutput {
  bookId: string;
  title: string;
  price: {
    currency: string;
    cents: number;
  };
  author: {
    firstName: string;
    lastName: string;
  };
}
