import {AutoIncrement, Column, DataType, ForeignKey, Model, NotNull, PrimaryKey, Table} from "sequelize-typescript";
import Message from "./Message";


@Table({
    tableName: 'uploadedfiles',
    timestamps: false,
})
export default class File extends Model{
    @PrimaryKey
    @Column(DataType.STRING)
    declare id: string;

    @ForeignKey(() => Message)
    @Column(DataType.INTEGER)
    declare message_id: number;

    @Column(DataType.STRING)
    declare name: string;
}