export default class User {
  constructor(
    private data: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      birthDate: Date;
    }
  ) {}

  get id() {
    return this.data.id;
  }

  get firstName() {
    return this.data.firstName;
  }

  get lastName() {
    return this.data.lastName;
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
}
