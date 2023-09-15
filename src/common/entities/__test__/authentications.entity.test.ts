import { Repository } from "typeorm";
import AuthenticationsEntity from "../authentications.entity";
import AppDataSource from "../../db/data-source";
import { generateTokenId } from "../../../utils/token";

describe("AuthenticationsEntity Test", () => {
  let authenticationRepository: Repository<AuthenticationsEntity>;
  let tokenId: string;

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  beforeEach(async () => {
    tokenId = generateTokenId("luthfikhann");
    authenticationRepository = AppDataSource.getRepository(AuthenticationsEntity);
  });

  test("Save Auth", async () => {
    const data = await authenticationRepository.save({
      tokenId,
    });

    expect(data.id).toBeDefined();
  });

  test("Delete Auth", async () => {
    const data = await authenticationRepository.save({
      tokenId,
    });
    const beforeDelete = await authenticationRepository.findOne({
      where: { tokenId },
    });
    expect(data.id).toBeDefined();
    expect(beforeDelete).not.toBeNull();
    expect(beforeDelete.id).toBeDefined();

    await authenticationRepository.delete({ tokenId });

    const afterDelete = await authenticationRepository.findOne({
      where: { tokenId },
    });
    expect(afterDelete).toBeNull();
  });
});
