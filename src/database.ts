import { Sequelize } from 'sequelize-typescript'
import { DataEntry } from './Models/DataEntry.js'

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.DATABASE,
    models: [ 
        DataEntry,
    ],
    logging: false
});

export default sequelize;