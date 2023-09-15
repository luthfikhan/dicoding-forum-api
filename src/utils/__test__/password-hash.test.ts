import { hashPassword, isCorrectPassword } from "../password-hash";

describe("Password Hash", () => {
  test("Return dari hash pass !== password", () => {
    const currentPassword = "IniStrongPassword";

    const hash = hashPassword(currentPassword);

    expect(hash).not.toEqual(currentPassword);
  });

  test("Hash Matcher - Valid Password", () => {
    const currentPassword = "IniStrongPassword";

    const hash = hashPassword(currentPassword);

    expect(isCorrectPassword(hash, currentPassword)).toBeTruthy();
  });

  test("Hash Matcher - Invalid Password", () => {
    const currentPassword = "IniStrongPassword";
    const inputPassword = "InIStrongPassword";

    const hash = hashPassword(currentPassword);

    expect(isCorrectPassword(hash, inputPassword)).toBeFalsy();
  });
});
