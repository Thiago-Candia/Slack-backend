import express from 'express'
import { ServerError } from '../utils/errors.util.js'
import UserRepository from '../repositories/user.repository.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ENVIRONMENT from "../config/environment.config.js"
import { sendMail } from '../utils/mailer.utils.js'
import { USER_PROPS } from '../models/User.model.js'

export const registerController = async (req, res) => {
    try {
        const { 
            username,
            password, 
            email,
            profile_avatar_base64
        } = req.body 

        if(!username){ 
            throw new ServerError('Todos los campos son obligatorios', 400)
            }
        if(!email){ 
            throw new ServerError('Todos los campos son obligatorios', 400)
            }
        if(!password){ 
            throw new ServerError('Todos los campos son obligatorios', 400)
            }

            const passwordHash = await bcrypt.hash(password, 10)

            const verification_token = jwt.sign(
                {email},
                ENVIRONMENT.SECRET_KEY_JWT,
                {expiresIn: '24h'} 
            ) 

            await UserRepository.create(
                {
                    username, 
                    email, 
                    password: passwordHash,
                    profile_avatar_base64,
                    verification_token
                }
            )

            await sendMail({
                to: email,
                subject: 'Valida tu email',
                html: 
                    `
                        <h1>Valida tu email</h1>
                        <p>Para validar tu email haz click en el siguiente enlace:</p>
                        <a href='${ENVIRONMENT.URL_BACKEND}/api/auth/verify-email?verification_token=${verification_token}'>
                            Verificar cuenta
                        </a>
                    `
            })

        return res.status(201).send({
            ok: true,
            message: 'Usuario creado exitosamente',
            status: 200
        })
    }
    catch (error) {
        console.log('Error al registrar:', error)
        if(error.status){
            return res.status(400).send({
                ok: false,
                message: error.message,
                status: error.status
            })
        }
        return res.status(500).send({
            ok: false,
            message: 'Interal server error',
            status: 500
        })
    }
}


export const verifyEmailController = async (req, res) => {
    try{
        const { verification_token } = req.query
        const payload =jwt.verify(verification_token, ENVIRONMENT.SECRET_KEY_JWT)
        const { email } = payload
        const user_found = await UserRepository.verifyUserByEmail(email) 
        res.redirect(ENVIRONMENT.URL_FRONTEND + '/login')
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


export const loginController = async (req, res) => {
    try{
        const {email, password} = req.body
        const user_found = await UserRepository.findUserByEmail(email)
        if(!user_found){
            throw new ServerError('Usuario no encontrado', 404)
        }
        if(!user_found.verified){
            throw new ServerError('Usuario no verificado', 400)
        }
        const isSamePassword = await bcrypt.compare(password, user_found.password)
        if(!isSamePassword){
            throw new ServerError('Contraseña incorrecta', 400)
        }
        const authorization_token = jwt.sign(
            {
                _id: user_found._id,
                [USER_PROPS.USERNAME]: user_found.username,
                [USER_PROPS.EMAIL]: user_found.email
            },
            ENVIRONMENT.SECRET_KEY_JWT,
            {expiresIn: '2h'}
        )
        res.json({
            ok: true,
            message: 200,
            message: 'Login exitoso',
            payload: { authorization_token }
        })
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


/* CONTROLADOR PARA RESETEAR LA CONTRASEÑA */

export const resetPasswordController = async (req, res) => {
    try{
        const { email } = req.body
        const user_found = await UserRepository.findUserByEmail(email)
        if(!user_found){
            throw new ServerError('Usuario no encontrado', 404)
        }
        if(!user_found.verified){
            throw new ServerError('Usuario aun no verificado', 400)
        }

        const reset_token = jwt.sign(
            {email, _id: user_found._id}, 
            ENVIRONMENT.SECRET_KEY_JWT,
            {expiresIn: '2h'}
        )

        await sendMail({
            to: email,
            subject: 'Restablece tu contraseña',
            html: `
                <h1>Has solicitado restablecer tu contraseña</h1>
                <p>Para restablecer tu contraseña haz click en el siguiente enlace:</p>
                <a href='${ENVIRONMENT.URL_FRONTEND}/rewrite-password?reset_token=${reset_token}'>
                    <button> Restablecer contraseña </button>
                </a>
            `
        })
        res.json(
            {
                ok: true,
                status: 200,
                message: 'reset mail send'
            }
        )
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



export const rewritePasswordController = async (req, res) => {
    try{
        const {password, reset_token} = req.body 
        const { _id } = jwt.verify(reset_token, ENVIRONMENT.SECRET_KEY_JWT)

        const newHashedPassword = await bcrypt.hash(password, 10) 
        await UserRepository.changeUserPassword(_id, newHashedPassword) 

        return res.json({
            ok: true,
            message: 'Contraseña restablecida exitosamente',
            status: 200
        })
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

