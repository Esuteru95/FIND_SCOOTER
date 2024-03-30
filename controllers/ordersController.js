import express from "express";
import Product from "../models/productModel.js";
import Account from "../models/accountModel.js";
import Order from "../models/ordersModel.js";
import isAuth from '../services/isAuth.js';
const router = express.Router();

/**
 * @swagger
 * components:
 *  schemas:
 *      createOrder:
 *        type: object
 *        required:
 *          - email
 *          - productid
 *        properties:
 *          email:
 *            type: string
 *            description: The user email
 *          productid:
 *            type: integer
 *            description: The product id
 *      getOrdersI:
 *        type: object
 *        required:
 *          - userID
 *        properties:
 *          userID:
 *            type: integer
 *            description: The user id
 *      getOrdersO:
 *        type: object
 *        required:
 *          - id
 *          - userID
 *          - userFN
 *          - user LN
 *          - productID
 *          - productType
 *          - productModel
 *          - correntDate
 *        properties:
 *          id:
 *            type: integer
 *            description: The order id
 *          userID:
 *            type: integer
 *            description: the user id
 *          userFN:
 *            type: string
 *            description: the user first name
 *          userLN:
 *            type: string
 *            description: the user last name
 *          productType:
 *            type: string
 *            description: the product type
 *          productModel:
 *            type: string
 *            description: the product model
 *          correntDate:
 *            type: string
 *            description: the date of create order
 */


/**
 * @swagger
 * tags:
 *  name: Orders
 *  description: The orders managing API
 */


/**
 * @swagger
 * /api/orders/getOrders:
 *  post:
 *      summary: Find all the user orders
 *      tags: [Orders]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/getOrdersI'
 *      responses:
 *          200:
 *              description: The orders were found
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/getOrdersO'
 */
router.post("/getOrders", isAuth, (req, res) => {
    const { userID } = req.body
    Order.findAll({ where: { userID: userID }})
    .then((results) => {
        if (results.length){
            return res.status(200).json({
                message: results,
            });
        }
        else{
            return res.status(401).json({
                message: "The user has no orders",
            });
        }
    })
    .catch((error) => {
        return res.status(500).json({
          message: error,
        });
    });
});

/**
 * @swagger
 * /api/orders/createNewOrder:
 *  post:
 *      summary: create new order
 *      tags: [Orders]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/createOrder'
 *      responses:
 *          200:
 *              description: The order was created
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/getOrdersO'
 */
router.post("/createNewOrder", isAuth, (req, res) => {
    const {
        email,
        productid,
    } = req.body;
    Account.findAll({ where: { email: email } })
    .then((results) => {
        let account = [];
        if(results){
            account = results[0];
        }
        Product.findByPk(productid)
        .then((item) => {
            if(item && item.isAvailable)
            {
                item.isAvailable = 0
                Order.create({
                    userID: account.id,
                    userFN: account.firstName,
                    userLN: account.lastName,
                    productID: item.id,
                    productType: item.productType,
                    productModel: item.productModel,
                    correntDate: new Date

                })
                return item.save().then(order_added => {
                    return res.status(200).json({
                        message: order_added
                    })
                })
                .catch(error => {
                    return res.status(500).json({
                        message: error
                    })
                })
            }
            else{
                return res.status(401).json({
                    message: "The item isn't available!"
                })
            }

        })
        .catch(error => {
            return res.status(500).json({
                message: error
            })
        })
    })
    .catch(error => {
        return res.status(500).json({
            message: error
        })
    })
})


export default router;