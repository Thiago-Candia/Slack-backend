import ENVIRONMENT from "../config/environment.config.js"
import Workspace, { WORKSPACE_PROPS } from "../models/Workspace.model.js"
import workspaceRepository from "../repositories/workspace.repository.js"
import jwt from 'jsonwebtoken'

export const createWorkspaceController = async (req, res) => {
    try{
        const { name } = req.body
        const owner_id = req.user._id
        const new_workspace = await workspaceRepository.createWorkspace(
            { 
                [WORKSPACE_PROPS.NAME]: name,
                [WORKSPACE_PROPS.OWNER]: owner_id
            }
        ) 

        res.json({
            ok: true,
            status: 201,
            message: 'Workspace created',
            payload: {
                new_workspace
            }
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


export const inviteUserWorkspaceController = async (req, res) => {
    try{
        const user_id = req.user._id
        const { invited_id, workspace_id } = req.params 
        const workspace_found = await workspaceRepository.addNewMember(
            {
                workspace_id, 
                owner_id: user_id, 
                invited_id
            }
        )
        res.json({
            ok: true,
            status: 201,
            message: 'Nuevo miembro',
            payload: { 
                workspace_found 
            }
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

/* USUARIO VEA LISTA DE WORKSPACES */

export const getWorkspacesController = async (req, res) => {
    try{
        const user_id = req.user._id
        const workspaces = await workspaceRepository.findWorkspacesByUser(user_id)
        res.json({
            ok: true,
            status: 200,
            payload: { 
                user: req.user, workspaces 
            }
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

/* WORKSPACE POR ID A PARAM */


export const getWorkspaceByIdController = async (req, res) => {
    try{
        const { workspace_id } = req.params
        const workspace = await Workspace.findById(workspace_id)
        if(!workspace) {
            return res.status(404).json({ message: 'Workspace no encontrado' });
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


export const inviteUserToWorkspaceController = async (req, res) => {
    try{
        const { workspace_id } = req.params
        const workspace = await Workspace.findById(workspace_id)
        if(!workspace) {
            return res.status(404).json({ message: 'Workspace no encontrado' });
        }
        //token de invitacion con vencimiento
        const inviteToken = jwt.sign({ workspace_id }, ENVIRONMENT.SECRET_KEY_JWT , { expiresIn: '7d' });
        const invite_link = `${ENVIRONMENT.URL_FRONTEND}/workspace/join/${inviteToken}`
        res.json({
            ok: true,
            status: 200,
            payload: { 
                invite_link
            }
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

export const joinWorkspaceController = async (req, res) => {
    try{
        const { token } = req.params
        const user_id = req.user._id

        const decoded = jwt.verify(token, ENVIRONMENT.SECRET_KEY_JWT);
        const { workspace_id } = decoded

        const workspace = await Workspace.findById(workspace_id)

        if(!workspace) {
            return res.status(404).json({ message: 'Workspace no encontrado' });
        }

        if(workspace.members.includes(user_id)) {
            return res.status(400).json({ message: 'Ya eres miembro de este workspace' });
        }

        workspace.members.push(user_id)
        await workspace.save()

        res.json({
            ok: true,
            status: 200,
            message: 'Te has unido con exito',
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




