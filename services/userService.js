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
        const updatedUser = await userRepo.updateUser(id, data);
        return updatedUser;
    } catch (err) {
        // Handle duplicate key errors (email or username)
        if (err instanceof mongodb.MongoServerError && err.code === 11000) {
          const dupFields = Object.keys(err.keyPattern || err.keyValue || {});
          const field = dupFields[0] || "field";
    
          const e = new Error(
            field === "email"
              ? "Email has already been used"
              : field === "username"
              ? "Username has already been used"
              : "Account already exists"
          );
          e.status = 409;
          throw e;
        }
    
        throw err;
      }
}
async function deleteUser(id){
    return await userRepo.removeUser(id); 
}

module.exports = {getAllUsers, getUser, updateUser, deleteUser};