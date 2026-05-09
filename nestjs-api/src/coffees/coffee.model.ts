import {
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'coffees',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false,
})
export class Coffee extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare type: string;

  @CreatedAt
  declare createdAt: Date;
}
