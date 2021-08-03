export default interface Admin {
  info: AdminInfo;
}

export interface AdminInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: Date;
}
