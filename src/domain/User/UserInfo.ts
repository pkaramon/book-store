import Password from "../Password";

export default interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: Password;
  birthDate: Date;
}
