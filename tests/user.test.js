const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId,userOne,setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Sign up user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Hank',
        email: 'hanknine@example.com',
        password: 'hank520'
    }).expect(201)

    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Asert about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Hank',
            email: 'hanknine@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('hank520')
})

test('Login a user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    //Assert that the new token in response matches the users second token
    const user = await User.findById(userOne._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexisting user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'abcd1234!'
    }).expect(400)
})

test('Get user profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Delete user account', async () => {
    await request(app)
        .delete(`/users/${userOneId}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete(`/users/${userOneId}`)
        .send()
        .expect(401)
})

test('Upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile_pic.png')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: '科比'
        })
        .expect(200)

        const user = await User.findById(userOneId)
        expect(user.name).toEqual('科比')
})

test('Update invalid user field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            height:201
        })
        .expect(400)
})