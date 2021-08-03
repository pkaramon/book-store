import Admin from "../domain/Admin";
import InMemoryDb from "./InMemoryDb";

export default class InMemoryAdminDb extends InMemoryDb<Admin> {
  protected getId(item: Admin): string {
    return item.info.id
  }

}
