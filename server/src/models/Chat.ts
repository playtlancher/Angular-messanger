import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  DataType,
} from "sequelize-typescript";

@Table({
  tableName: "chats",
  timestamps: false,
})
export default class Chat extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  public id!: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  public name!: string;
}
