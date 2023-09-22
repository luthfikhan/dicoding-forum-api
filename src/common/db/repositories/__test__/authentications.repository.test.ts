import { generateTokenId } from "../../../../utils/token";
import AuthenticationsRepositoryType from "../../../../types/repositories/authentications.repository.type";
import AppDataSource from "../../db.config";
import AuthenticationsEntity from "../../entities/authentications.entity";
import AuthenticationsRepository from "../authentications.repository";

describe("Authentications Repository Test", () => {
  let authenticationRepository: AuthenticationsRepositoryType;
  let tokenId: string;

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(async () => {
    tokenId = generateTokenId("luthfikhann");
    authenticationRepository = new AuthenticationsRepository(AppDataSource);
  });

  afterEach(async () => {
    await AppDataSource.getRepository(AuthenticationsEntity).clear();
  });

  test("Save Auth", async () => {
    const data = await authenticationRepository.saveAuth({
      tokenId,
    } as AuthenticationsEntity);

    expect(data.id).toBeDefined();
  });

  test("Find Not Found Auth", async () => {
    const data = await authenticationRepository.findAuth("Token");

    expect(!!data).toBeFalsy();
  });

  test("Find Auth", async () => {
    await authenticationRepository.saveAuth({
      tokenId,
    } as AuthenticationsEntity);
    const data = await authenticationRepository.findAuth(tokenId);

    expect(data.id).toBeDefined();
  });

  test("Delete Auth", async () => {
    const data = await authenticationRepository.saveAuth({
      tokenId,
    } as AuthenticationsEntity);

    expect(data.id).toBeDefined();
    await authenticationRepository.deleteAuth(data.tokenId);
    const dataAfterDeletion = await authenticationRepository.findAuth(tokenId);
    expect(!!dataAfterDeletion).toBeFalsy();
  });
});
