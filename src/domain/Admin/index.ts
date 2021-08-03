import User, { UserInfo } from "../User";

export default abstract class Admin extends User {}

export interface AdminInfo extends UserInfo {}
