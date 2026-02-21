const userRepo = require('../repositories/userRepo.js');
const mongodb = require('mongodb');
const bcrypt = require('bcrypt');

async function getAllUsers(){
    return await userRepo.findAllUsers(); 
}
async function getUser(id){
    return await userRepo.findUserById(id); 
}
async function updateUser(id, data){
    if(data.password){ 
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;
    }
        try{
            const updatedUser = await userRepo.update(id, data);
            return updatedUser;
        } catch (error) {
            if(error instanceof MongoServerError) {
                if(error.code === '11000'){
                    const error = new Error('Email has already been used');
                    error.status = 409;
                    throw error;
                }
                throw error;
            }
        }
}
async function deleteUser(id){
    return await userRepo.remove(id); 
}
async function patchUser(id, data){
    const updatedUser = await userRepo.update(id, data);
        if (updatedUser) return updatedUser;
        else {
            const error = new Error(`Cannot find user with id ${id}`);
            error.status = 404;
            throw error;
        }
}

module.exports = {getAllUsers, getUser, updateUser, deleteUser, patchUser};