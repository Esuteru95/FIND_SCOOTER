import jwt from "jsonwebtoken";
import Account from '../models/accountModel.js';
import dotenv from 'dotenv';
dotenv.config();

export default (req,res,next) => {
    
    const header = req.headers['authorization'];

    if(header){
        const bearer = header.split(' ');
        const token = bearer[1];

        jwt.verify(token, process.env.TOKEN_KEY, (err, thedata) => {
            if(err){
                return res.status(403)
            } else {
                Account.findAll({ where: { email: thedata.email } })
                .then(results => {
                    const account = results[0];
                    req.account = account;
                    next();
                })
            }
        })
    } else {
        return res.status(403)
    }
}