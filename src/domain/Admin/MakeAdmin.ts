import Admin, { AdminInfo } from ".";

export default interface MakeAdmin {
  (info: AdminInfoWithOptionalId): Promise<Admin> | Admin;
}

export type AdminInfoWithOptionalId = Omit<AdminInfo, "id"> & { id?: string };
