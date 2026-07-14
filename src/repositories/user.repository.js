import User, { USER_PROPS } from "../models/User.model.js";
import { ServerError } from "../utils/errors.util.js";

class UserRepository {
    async create(
        {
            [USER_PROPS.USERNAME]: username, 
            [USER_PROPS.EMAIL]: email, 
            [USER_PROPS.PASSWORD]: password, 
            [USER_PROPS.PROFILE_AVATAR_BASE64]: profile_avatar_base64,
            [USER_PROPS.VERIFICATION_TOKEN]: verification_token
        }
    ){
        try{
            await User.create({username, email, password, profile_avatar_base64, verification_token})
        }
        catch(error){
            if(error.code === 11000){
                if(error.keyPattern.email){
                    throw new ServerError('Email ya registrado', 400)
                }
                if(error.keyPattern.username){
                    throw new ServerError('Nombre de usuario ya registrado', 400)
                }
            }
            console.log('Error al crear el usuario', error)
            throw error 
        }
    }

    async verifyUserByEmail(email){
        const user_found = await User.findOne({[USER_PROPS.EMAIL]: email})

        if(!user_found){
            throw new ServerError('Usuario no encontrado', 404)
        } 
        if(user_found.verified){
            throw new ServerError('Email ya verificado', 400)
        }

        user_found.verified = true 
        await user_found.save()
        return user_found
    }

    async findUserByEmail (email) {
    return await User.findOne({[USER_PROPS.EMAIL]: email})
    }

    
    async changeUserPassword(id, newPassword) {
        const user_found = await User.findById(id) 
        if(!user_found) { 
            throw new ServerError('Usuario no encontrado', 404)
        }
        user_found.password = newPassword 
        await user_found.save() 
    }
    
    async updateUser(user_id, updateData) {
        try {
            return await User.findByIdAndUpdate(
                user_id,
                updateData,
                {
                    new: true,
                    runValidators: true,
                    select: "email username profile_avatar_base64"
                }
            )
        }
        catch (error) {
            console.log('Error al actualizar el usuario', error)
            throw new ServerError('Error al atualizar el usuario', 400)
        }
    }

}

export default new UserRepository()
