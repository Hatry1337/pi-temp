import { Table, Model, Column, DataType } from "sequelize-typescript";

@Table({
    timestamps: true,
})
export class DataEntry extends Model {
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    })
    eId!: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    date!: Date;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    humidity!: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    temperature!: number;
}