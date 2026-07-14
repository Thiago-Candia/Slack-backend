import mongoose from "mongoose";
import ENVIRONMENT from "./environment.config.js";


const connectToMongoDB = async () => {
    try{
        const response = await mongoose.connect(ENVIRONMENT.MONGO_DB_URL)
        console.log('conexion exitosa con MongoDB \nConectados a la base de datos:', response.connection.name)
    }

    catch(error){
        console.log('Error al conectarse a la DB', error)
    }
}


connectToMongoDB() //se debe ejecutar en el server

export default mongoose


