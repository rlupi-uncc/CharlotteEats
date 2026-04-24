const userRepo = require('../repositories/userRepo.js');
const Restaurant = require('../models/Restaurant');
const mongodb = require('mongodb');
const bcrypt = require('bcrypt');

async function getReviewCount(userId) {
  const isValidObjectId =
    typeof userId === 'string' && mongodb.ObjectId.isValid(userId);

  const match =
    isValidObjectId
      ? {
          $or: [
            { 'reviews.userId': userId },
            { 'reviews.userId': new mongodb.ObjectId(userId) },
          ],
        }
      : { 'reviews.userId': userId };

  const result = await Restaurant.aggregate([
    { $unwind: '$reviews' },
    { $match: match },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  return result.length > 0 ? result[0].count : 0;
}

async function getAllUsers(){
    return await userRepo.findAllUsers(); 
}
async function getUser(id){
    const user = await userRepo.findUserById(id);
    if (user) {
        user.reviewCount = await getReviewCount(id);
    }
    return user;
}
async function updateUser(id, data){
    try{
        const updatedUser = await userRepo.updateUser(id, data);
        return updatedUser;
    } catch (err) {
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