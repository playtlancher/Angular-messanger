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
  public id!: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public from!: number;

  @ForeignKey(() => Chat)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public chat!: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  public text!: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  public date!: Date;
}
