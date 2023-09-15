import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("authentications")
class AuthenticationsEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  tokenId: string;
}

export default AuthenticationsEntity;
