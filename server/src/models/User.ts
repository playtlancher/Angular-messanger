import { Table, Column, AutoIncrement, AllowNull, PrimaryKey, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "users",
  timestamps: false,
})
export default class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare username: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string;
}
