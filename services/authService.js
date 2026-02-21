const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepo.js');
const mongodb = require('mongodb');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE_IN = process.env.JWT_EXPIRES_IN;

async function signUp(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try{
        const newUser = await userRepo.createUser({username, email, password: hashedPassword});
        return newUser;
    } catch (error) {
        //Might need to refactor this in the future
        if(error instanceof mongodb.MongoServerError) {
            if(error.code === '11000'){
                const error = new Error('Email has already been used');
                error.status = 409;
                throw error;
            }
            throw error;
        }
    }
}

async function logIn(email, password){
    const user = await userRepo.findUserByEmail(email);
    if (!user) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
    }

    const accessToken = jwt.sign({id: user.id, role: user.role}, JWT_SECRET, {expiresIn: JWT_EXPIRE_IN});
    return accessToken;
}

module.exports = {signUp, logIn};