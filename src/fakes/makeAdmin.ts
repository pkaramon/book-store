import MakeAdmin from "../domain/Admin/MakeAdmin";
import Admin  from "../domain/Admin";

const makeAdmin: MakeAdmin = (info) => {
  return new Admin({
    ...info,
    id: info.id ?? Math.random().toString(),
  });
};
export default makeAdmin;
