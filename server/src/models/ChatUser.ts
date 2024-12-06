import {
  Table,
  Column,
  Model,
  ForeignKey,
  PrimaryKey,
  AllowNull,
  AutoIncrement,
  DataType,
} from "sequelize-typescript";
import User from "./User";
import Chat from "./Chat";

@Table({
  tableName: "chat_users",
  timestamps: false,
})
export default class ChatUser extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public id!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  public user_id!: number;

  @ForeignKey(() => Chat)
  @Column(DataType.INTEGER)
  public chat_id!: number;
}
