import ENVIRONMENT from "../config/environment.config.js"
import { ServerError } from "../utils/errors.util.js"
import jwt from 'jsonwebtoken'



//Middleware
export const authMiddleware = (req, res, next) => {
    try{
        const authorization_header = req.headers['authorization']

        //opcional
        if(!authorization_header){ 
            throw new ServerError('No has proporcionado un header de autorizacion', 401)
        }

        const authorization_token = authorization_header.split(' ')[1]
        if(!authorization_token){
            throw new ServerError('No has proporcionado un token de autorizacion', 401) 
        }

        try{
            const user_info = jwt.verify(authorization_token, ENVIRONMENT.SECRET_KEY_JWT)
            req.user = user_info
            next()
        }
        catch(error){
            throw new ServerError('Token invalido o vencido', 400)
        }

    }
    catch(error){
        console.log('Error al registrar:', error)
        if(error.status){
            return res.send({
                ok: false,
                message: error.message,
                status: error.status
            })
        }
        return res.send({
            ok: false,
            message: 'Interal server error',
            status: 500
        })
    }
}
