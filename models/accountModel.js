import Sequelize from 'sequelize';
import database from '../services/database.js';

const Account = database.define('accounts', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    verificationCode: Sequelize.INTEGER,
    isVerified: Sequelize.BOOLEAN,
    forgotPassw: Sequelize.BOOLEAN
});

export default Account;