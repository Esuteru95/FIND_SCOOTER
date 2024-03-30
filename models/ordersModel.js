import Sequelize from 'sequelize';
import database from '../services/database.js';


const Order = database.define('orders', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userID: { type: Sequelize.INTEGER, allowNull: false },
    userFN: { type: Sequelize.STRING },
    userLN: { type: Sequelize.STRING },
    productID: { type: Sequelize.INTEGER, allowNull: false },
    productType: { type: Sequelize.STRING },
    productModel: { type: Sequelize.STRING },
    correntDate: { type: Sequelize.DATE, allowNull: false }
});

export default Order;