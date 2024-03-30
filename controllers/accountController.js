import express from "express";
const router = express.Router();
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Account from "../models/accountModel.js";
import dotenv from 'dotenv';
import isAuth from '../services/isAuth.js';
dotenv.config();


/**
 * @swagger
 * components:
 *  schemas:
 *      UserLogin:
 *        type: object
 *        required:
 *          - email
 *          - password
 *        properties:
 *          email:
 *            type: string
 *            description: The user email address
 *          password:
 *            type: string
 *            description: The user password
 *      TokenResponse:
 *        type: object
 *        required:
 *          - token
 *        properties:
 *          token:
 *            type: string
 *            description: The login token
 *      VerifyUserCode:
 *        type: object
 *        required:
 *          - code
 *          - email
 *        properties:
 *          email:
 *            type: string
 *            description: The user email address
 *          code:
 *            type: integer
 *            description: The code to verify
 *      UpdatePassword:
 *        type: object
 *        required:
 *          - email
 *          - password
 *          - newpassword
 *        properties:
 *          email:
 *            type: string
 *            description: The user email address
 *          password:
 *            type: string
 *            description: The user password
 *          newpassword:
 *            type: string
 *            description: The new user password
 *      ReqToChangeFP:
 *        type: object
 *        required:
 *          - email
 *        properties:
 *          email:
 *            type: string
 *            description: The user email address
 *      ChangeFP:
 *        type: object
 *        required:
 *          - email
 *          - code
 *          - newpassword
 *        properties:
 *          email:
 *            type: string
 *            description: The user email address
 *          code:
 *            type: integer
 *            description: The code to verify
 *          newpassword:
 *            type: string
 *            description: The new password
 *      User:
 *        type: object
 *        required:
 *          - firstName
 *          - lastName
 *          - email
 *          - password
 *        properties:
 *          id:
 *            type: integer
 *            description: The auto-generated id of the user
 *          firstName:
 *            type: string
 *            description: The first name of the user
 *          lastName:
 *            type: string
 *            description: The last name of the user
 *          email:
 *            type: string
 *            description: The user email address
 *          password:
 *            type: string
 *            description: The user crypt password
 *          verificationCode:
 *            type: integer
 *            description: Generated code for account validation
 *          isVerified:
 *            type: boolean
 *            description: Get default value of false untill user validation
 *          forgotPassw: 
 *            type: boolean
 *            description: Get default value of false untill user validation
 */

/**
 * @swagger
 * tags:
 *  name: Accounts
 *  description: The accounts managing API
 */

/**
 * @swagger
 * /api/account/signup:
 *  post:
 *      summary: Create new user account
 *      tags: [Accounts]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *      responses:
 *          200:
 *              description: The user account was successfully created
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 */
router.post("/signup", (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  Account.findAll({ where: { email: email } })
    .then(async (results) => {
      if (results.length == 0) {
        const hash = await bcryptjs.hash(password, 10);
        const code = Math.floor(1000 + Math.random() * 9000);
        Account.create({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: hash,
          verificationCode: code,
          isVerified: false,
          forgotPassw: false
        })
          .then((account_created) => {
            return res.status(200).json({
              message: account_created,
            });
          })
          .catch((error) => {
            return res.status(500).json({
              message: error,
            });
          });
      } else {
        return res.status(401).json({
          message: "Username is not available, please try another email",
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
 * /api/account/users:
 *  get:
 *      summary: Return the list of all users
 *      tags: [Accounts]
 *      responses:
 *          200:
 *              description: The list of the users
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/User'
 */
router.get("/users", isAuth, (req, res) => {
  Account.findAll()
    .then((results) => {
      return res.status(200).json({
        message: results,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error,
      });
    });
});

/**
 * @swagger
 * /api/account/deleteAccount/{id}:
 *  delete:
 *      summary: Delete an account by id
 *      tags: [Accounts]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: integer
 *            required: true
 *            description: The user id
 *      responses:
 *          200:
 *              description: The user account was deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 */
router.delete("/deleteAccount/:id", isAuth, (req, res) => {
  const userId = req.params.id;
  Account.findByPk(userId)
    .then((results) => {
      return results.destroy().then((account) => {
        return res.status(200).json({
          message: account,
        });
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error,
      });
    });
});

//A
/**
 * @swagger
 * /api/account/updateAccPassword:
 *  put:
 *    summary: Update account password
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UpdatePassword'
 *    responses:
 *      200:
 *        description: The user password was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UpdatePassword'
 */
router.put("/updateAccPassword", isAuth, (req, res) => {
  const { email, password, newpassword } = req.body;
  Account.findAll({ where: { email: email } })
    .then(async(results) => {
      if (results.length > 0) {
        const account = results[0];
        const isMatch = await bcryptjs.compare(password, account.password);
          if (isMatch) {
            const hash = await bcryptjs.hash(newpassword, 10);
            account.password = hash;
            return account.save().then((results) => {
              return res.status(200).json({
                message: "Password is changed"
              });
            });
          }
          else {
            return res.status(401).json({
              message: "Wrong password",
            });
          }
      }
      else {
        return res.status(401).json({
          message: "User isn't found",
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
 * /api/account/updateAccount/{id}:
 *  put:
 *    summary: Update account details
 *    tags: [Accounts]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: The user id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: The user account was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
router.put("/updateAccount/:id", isAuth, isAuth,(req, res) => {
  const userId = req.params.id;
  const { firstName, lastName } = req.body;

  Account.findByPk(userId)
    .then((account) => {
      if (account) {
        account.firstName = firstName;
        account.lastName = lastName;
        return account.save().then((results) => {
          return res.status(200).json({
            message: results,
          });
        });
      } else {
        return res.status(401).json({
          message: "User not found",
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
 * /api/account/verify:
 *  put:
 *    summary: Verify user code
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/VerifyUserCode'
 *    responses:
 *      200:
 *        description: Verify the user code update
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
router.put("/verify", (req, res) => {
  const { code, email } = req.body;
  Account.findAll({ where: { email: email } })
    .then((results) => {
      if (results.length > 0) {
        const account = results[0];
        if (parseInt(account.verificationCode) === parseInt(code)) {
          account.isVerified = true;
          return account.save().then((success) => {
            return res.status(200).json({
              message: success,
            });
          });
        } else {
          return res.status(401).json({
            message: "Verification code is not match",
          });
        }
      } else {
        return res.status(401).json({
          message: "User not found",
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
 * /api/account/login:
 *  post:
 *    summary: Login
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserLogin'
 *    responses:
 *      200:
 *        description: The login credential token
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/TokenResponse'
 *    
 */
router.post("/login", (req, res) => {
  // request > email + password
  const { email, password } = req.body;
  // find the user account
  Account.findAll({ where: { email: email } })
    .then(async (results) => {
      if (results.length > 0) {
        const account = results[0];

        // check if user verified the code
        if (account.isVerified) {
          // check for password
          const isMatch = await bcryptjs.compare(password, account.password);
          if (isMatch) {


            const dataToToken = {
              id: account.id,
              firstName: account.firstName,
              lastName: account.lastName,
              email: account.email
            }

            const token = jwt.sign(dataToToken, process.env.TOKEN_KEY);
            return res.status(200).json({
              message: token
            });
          } else {
            return res.status(401).json({
              message: "The password is not match",
            });
          }
        } else {
          return res.status(401).json({
            message: "Please verfy your account",
          });
        }
      } else {
        return res.status(401).json({
          message: "User not found",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: error,
      });
    });
});

//B
/**
 * @swagger
 * /api/account/reqToChangeForgotPass:
 *  post:
 *    summary: Request to change forgot password
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ReqToChangeFP'
 *    responses:
 *      200:
 *        description: The request sent. Check new verification code.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ReqToChangeFP'
 *    
 */
router.post("/reqToChangeForgotPass", (req, res) => {
  const { email } = req.body;
  Account.findAll({ where: { email: email } })
    .then(async (results) => {
      if (results.length > 0) {
        const account = results[0];
        account.verificationCode = Math.floor(1000 + Math.random() * 9000);
        account.forgotPassw = true;
        account.isVerified = false;
        return account.save().then((results) => {
          return res.status(200).json({
            message: "Request sent. Check new verification code."
          });
        });
      }
      else {
        return res.status(401).json({
          message: "User isn't found",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: error,
      });
    });
})

//B
/**
 * @swagger
 * /api/account/changeForgotPass:
 *  put:
 *    summary: Change the password
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ChangeFP'
 *    responses:
 *      200:
 *        description: Password is changed
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ChangeFP'
 */
router.put("/changeForgotPass",(req,res) =>{
  const { email, code, newpassword } = req.body;
  Account.findAll({ where: { email: email } })
  .then(async (results) => {
    if (results.length > 0) {
      const account = results[0];
      if (!(account.forgotPassw))
      {
        return res.status(401).json({
          message: "You have to send request to change password",
        });
      }
      else{
        if (account.verificationCode != code)
        {
          return res.status(401).json({
            message: "Incorrect verification code",
          });
        }
        else{
          const hash = await bcryptjs.hash(newpassword, 10);
          account.password = hash;
          account.forgotPassw = false;
          return account.save().then((results) => {
            return res.status(200).json({
              message: " The password was changed"
            });
          });

        }
      }
    }
    else{
      return res.status(401).json({
        message: "User isn't found",
      });
    }
  })
  .catch((error) => {
    return res.status(500).json({
      message: error,
    });
  });
})


export default router;
