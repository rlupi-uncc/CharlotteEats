import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {createUser, findUserByEmail} from '../respositories/userRepo.js';
import { MongoServerError } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE_IN = process.env.JWT_EXPIRES_IN;

export async function signUp(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try{
        const newUser = await createUser({username, email, password: hashedPassword});
        return newUser;
    } catch (error) {
        //Might need to refactor this in the future
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

export async function logIn(email, password){
    const user = await findUserByEmail(email);
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