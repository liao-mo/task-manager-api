const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendByeEmail } = require('../emails/account')
const router = new express.Router()

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const validUpdates = ['name', 'email', 'password', 'age']
    const isValidUpdate = updates.every((update) => validUpdates.includes(update))
    if (!isValidUpdate) {
        return res.status(400).send({ error: "Invalid updates!" })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/:id', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendByeEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        req.status(500).send(error)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Please upload image file.'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avtar', auth, upload.single('avtar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avtar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avtar', auth, async (req, res) => {
    req.user.avtar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avtar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user | !user.avtar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avtar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router