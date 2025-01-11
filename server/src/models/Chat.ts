import { Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, DataType } from "sequelize-typescript";

@Table({
  tableName: "chats",
  timestamps: false,
})
export default class Chat extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare name: string;
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare creator: number;
  @Column(DataType.TEXT)
  declare image: string;
}
