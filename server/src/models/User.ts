import {
  Table,
  Column,
  AutoIncrement,
  AllowNull,
  PrimaryKey,
  Model,
  DataType,
} from "sequelize-typescript";

@Table({
  tableName: "users",
  timestamps: false,
})
export default class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column(DataType.INTEGER)
  public id!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  public username!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public password!: string;
}
