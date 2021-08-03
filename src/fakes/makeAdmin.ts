import MakeAdmin from "../domain/Admin/MakeAdmin";
import Admin from "../domain/Admin";

const makeAdmin: MakeAdmin = (info) => {
  const admin: Admin = {
    info: { ...info, id: info.id ?? Math.random().toString() },
  };
  return admin;
};
export default makeAdmin;
