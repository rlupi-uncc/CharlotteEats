import {findAllUsers, findUserById, remove, update} from '../respositories/userRepo.js';
//Need MongoDB integration here
import bcrypt from 'bcrypt';

export async function getAllUsers(){
    return await findAllUsers(); 
}
export async function getUser(id){
    return await findUserById(id); 
}
export async function updateUser(id, data){
    if(data.password){ 
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;
    }
        try{
            const updatedUser = await update(id, data);
            return updatedUser;
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError) {
                if(error.code = 'P2002'){
                    const error = new Error('Email has already been used');
                    error.status = 409;
                    throw error;
                }
                throw error;
            }
        }
}
export async function deleteUser(id){
    return await remove(id); 
}
export async function patchUser(id, data){
    const updatedUser = await update(id, data);
        if (updatedUser) return updatedUser;
        else {
            const error = new Error(`Cannot find user with id ${id}`);
            error.status = 404;
            throw error;
        }
}