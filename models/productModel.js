import Sequelize from 'sequelize';
import database from '../services/database.js';

const Product = database.define('products', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    productType: Sequelize.STRING, //bic scooter  
    currentLocationLat: Sequelize.FLOAT,
    currentLocationLong: Sequelize.FLOAT,
    isAvailable: Sequelize.BOOLEAN,
    battery: Sequelize.INTEGER,
    productModel: Sequelize.STRING
});

export default Product;