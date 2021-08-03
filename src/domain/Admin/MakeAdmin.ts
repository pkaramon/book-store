import Admin from ".";
import { UserData } from "../User";

export default interface MakeAdmin {
  (data: AdminData): Promise<Admin> | Admin;
}

export interface AdminData extends UserData {
  id?: string;
}
