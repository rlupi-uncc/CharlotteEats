import mongoose from 'mongoose';

export async function createUser(data){
    return await prisma.User.create({data: data, omit: {password: true}});
}

export async function findUserByEmail(email){
    return await mongoose.User.findone({email: email});
}

export async function findUserById(id){
    return await mongoose.User.findById(id);
}

export async function findAllUsers() {
    return await mongoose.User.find({
        omit: { password: true},
    });
}

export async function update(id, updates){
    const updatedUser = await mongoose.User.updateOne({
        where: { id },
        data: updates,
        omit: { password: true}
    });
    if(updatedUser.modifiedCount === 0){
        return null
    } else {
        return updatedUser;
    }
}

export async function remove(id){
    const deletedUser = await mongoose.User.deleteOne({
      where: { id },
    });
    if(deletedUser.deletedCount === 0){
        return null
    } else {
        return deletedUser;
    }
}