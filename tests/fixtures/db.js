const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Kobe',
    email: 'kobe@email.com',
    password: 'iamkobe1234!',
    tokens: [
        { token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET) }
    ]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Bryant',
    email: 'Bryant@email.com',
    password: '666abc!!!',
    tokens: [
        { token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET) }
    ]
}

const taskOneId = new mongoose.Types.ObjectId()
const taskOne = {
    _id: taskOneId,
    description: 'First task',
    completed: false,
    owner: userOne._id
}

const taskTwoId = new mongoose.Types.ObjectId()
const taskTwo = {
    _id: taskTwoId,
    description: 'Second task',
    completed: true,
    owner: userOne._id
}

const taskThreeId = new mongoose.Types.ObjectId()
const taskThree = {
    _id: taskThreeId,
    description: 'Third task',
    completed: true,
    owner: userTwo._id
}

const setupDatabase = async()=>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}