import express from 'express';
import dotenv from 'dotenv';
import swaggerJSDoc from 'swagger-jsdoc';
import SwaggerUi from 'swagger-ui-express';
import accountController from './controllers/accountController.js'
import productsController from './controllers/productsController.js'
import ordersController from './controllers/ordersController.js'
import database from './services/database.js';

dotenv.config();
const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FindScooter API Documentation',
            version: '1.0.0',
            description: 'This is my first Swagger documentation'
        },
        servers:[
            {
                url:'http://localhost:3001'
            }
        ],
        components:{
            securitySchemes:{
                bearerAuth:{
                    type:'http',
                    scheme:'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security:[
            {
            bearerAuth: []
            }
        ]
    },
    apis: ['./controllers/*.js']
}
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(swaggerDocs));

app.use('/api/account', accountController);
app.use('/api/products', productsController);
app.use('/api/orders', ordersController);

const port = process.env.PORT;

database
.sync()
.then(results => {
    app.listen(port, () => {
        console.log(`Server is running via port ${port}`);
    })
})
.catch(error => {
    console.log(error);
})