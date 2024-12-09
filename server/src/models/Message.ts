import {
  Table,
  Column,
  Model,
  ForeignKey,
  AllowNull,
  DataType,
  Default,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  AfterDestroy,
} from "sequelize-typescript";
import User from "./User";
import Chat from "./Chat";

@Table({
  tableName: "messages",
  timestamps: false,
})
export default class Message extends Model {
  @AllowNull(false)
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare from: number;

  @ForeignKey(() => Chat)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare chat: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare text: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare date: Date;
}
