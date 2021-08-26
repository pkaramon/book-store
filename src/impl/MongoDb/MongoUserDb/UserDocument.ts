export default interface UserDocument {
  _id: string;
  userType: string;
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
  birthDate: Date;
}
