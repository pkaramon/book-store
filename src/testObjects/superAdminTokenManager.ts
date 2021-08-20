import crypto from "crypto";

interface SuperAdminTokenManager {
  create(): string | Promise<string>;
  verify(token: string): boolean | Promise<boolean>;
}

const fakeSuperAdminTokenManager = {
  validTokens: new Set<string>(),

  create() {
    const token = crypto.randomUUID();
    this.validTokens.add(token);
    return token;
  },

  verify(token: string) {
    return this.validTokens.has(token);
  },
};

const superAdminTokenManager: SuperAdminTokenManager =
  fakeSuperAdminTokenManager;
export default superAdminTokenManager;
