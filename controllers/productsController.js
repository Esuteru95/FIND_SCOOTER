import express from "express";
const router = express.Router();
import isAuth from '../services/isAuth.js';
import Product from "../models/productModel.js";
import geodist from 'geodist';

/**
 * @swagger
 * components:
 *  schemas:
 *      AddProduct:
 *        type: object
 *        required:
 *          - productType
 *          - currentLocationLat
 *          - currentLocationLong
 *          - productModel
 *        properties:
 *          productType:
 *            type: string
 *            description: The product type
 *          currentLocationLat:
 *            type: number
 *            description: The latitude
 *          currentLocationLong:
 *            type: number
 *            description: The longitude
 *          productModel:
 *            type: string
 *            description: The product model
 *      GetAllScootersI:
 *        type: object
 *        required:
 *          - currentLocationLat
 *          - currentLocationLong
 *        properties:
 *          currentLocationLat:
 *            type: number
 *            description: The latitude
 *          currentLocationLong:
 *            type: number
 *            description: The longitude
 *      GetAllScootersO:
 *        type: object
 *        required:
 *          - id
 *          - model
 *          - battery
 *          - dist
 *        properties:
 *          id:
 *            type: integer
 *            description: The id
 *          model:
 *            type: string
 *            description: The model
 *          battery:
 *            type: integer
 *            description: The battery
 *          dist:
 *            type: integer
 *            description: The dist
 *      UpdateProduct:
 *        type: object
 *        required:
 *          - LocationLat
 *          - LocationLong
 *          - isAvailable
 *        properties:
 *          LocationLat:
 *            type: number
 *            description: The latitude
 *          LocationLong:
 *            type: number
 *            description: The longitude
 *          isAvailable:
 *            type: integer
 *            description: Is product available
 */


/**
 * @swagger
 * tags:
 *  name: Products
 *  description: The products managing API
 */




/**
 * @swagger
 * /api/products/getAllScooters:
 *  post:
 *      summary: Find all products
 *      tags: [Products]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/GetAllScootersI'
 *      responses:
 *          200:
 *              description: The product was found
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/GetAllScootersO'
 */
router.post('/getAllScooters', isAuth, (req,res) => {

    const {lat, long} = req.body;

    Product.findAll()
    .then((results) => {
    
      let allProducts = [];

      results.forEach(element => {
        const dist = geodist(
            {
                lat: lat,
                lon: long
            }, 
            {
                lat: element.currentLocationLat,
                lon: element.currentLocationLong
            });

        const product = {
            id: element.id,
            model: element.productModel,
            battery: element.battery,
            dist: dist
        }
        allProducts.push(product)
      });


      return res.status(200).json({
        message: allProducts,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error,
      });
    });


})

/**
 * @swagger
 * /api/products/addProduct:
 *  post:
 *      summary: Add new product
 *      tags: [Products]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/AddProduct'
 *      responses:
 *          200:
 *              description: The pruoduct was added
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/AddProduct'
 */
router.post('/addProduct', isAuth, (req,res) => {
    const {
        productType,
        currentLocationLat,
        currentLocationLong,
        productModel
    } = req.body;

    Product.create({
        productType: productType,
        currentLocationLat: currentLocationLat,
        currentLocationLong: currentLocationLong,
        isAvailable: true,
        battery: 100,
        productModel: productModel
      })
      .then(product_added => {
        return res.status(200).json({
            message: product_added
        })
      })
      .catch(error => {
        return res.status(500).json({
            message: error
        })
      })
})

/**
 * @swagger
 * /api/products/updateProduct/{id}:
 *  put:
 *    summary: Update product details
 *    tags: [Products]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: The product id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UpdateProduct'
 *    responses:
 *      200:
 *        description: The product data was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/GetAllScootersO'
 */
router.put('/updateProduct/:id', isAuth, (req,res) => {
  const productId = req.params.id;
  const { LocationLat, LocationLong, isAvailable  } = req.body;

  Product.findByPk(productId)
    .then((product) => {
      if (product) {
        product.currentLocationLat = LocationLat;
        product.currentLocationLong = LocationLong;
        product.isAvailable = isAvailable;
        return product.save().then((results) => {
          return res.status(200).json({
            message: results,
          });
        });
      } else {
        return res.status(401).json({
          message: "Product not found",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: error,
      });
    });
})

/**
 * @swagger
 * /api/products/deleteProduct/{id}:
 *  delete:
 *      summary: Delete a product by id
 *      tags: [Products]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: integer
 *            required: true
 *            description: The product id
 *      responses:
 *          200:
 *              description: The product was deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/GetAllScootersO'
 */
router.delete('/deleteProduct/:d', isAuth, (req,res)=>{
  const productId = req.params.id;
  Product.findByPk(productId)
    .then((results) => {
      return results.destroy().then((product) => {
        return res.status(200).json({
          message: "Deleted"
        });
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error,
      });
    });
})

export default router;