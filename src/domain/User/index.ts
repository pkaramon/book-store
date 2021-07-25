export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: Date;
}

export default class User {
  constructor(private data: { id: string } & UserData) {}

  get id() {
    return this.data.id;
  }

  get firstName() {
    return this.data.firstName;
  }

  set firstName(firstName: string) {
    this.data.firstName = firstName;
  }

  get lastName() {
    return this.data.lastName;
  }

  set lastName(lastName: string) {
    this.data.lastName = lastName;
  }

  get email() {
    return this.data.email;
  }

  get password() {
    return this.data.password;
  }

  get birthDate() {
    return this.data.birthDate;
  }

  set birthDate(birthDate: Date) {
    this.data.birthDate = birthDate;
  }
}
