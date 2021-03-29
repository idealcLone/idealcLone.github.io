const { Router } = require('express')
const { check, validationResult } = require('express-validator')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

const router = Router()

//api/auth/register
router.post(
    '/register',
    [
        check('name', 'Incorrect name format').isString(),
        check('email', 'Incorrect email format').isEmail(),
        check('password', 'Too short password').isLength({ min: 4 })
    ],
    async (req, res) => {
        try {
            console.log(req.body);
            const errors = validationResul(req)

            if(!errors.isEmpty()) {
                return res.status(400).json({ 
                    errors: errors.array(),
                    message: 'Wrong registration data' 
                })
            }

            const { name, email, password } = req.body

            const candidate = await User.findOne({ email })

            if(candidate) {
                return res.status(400).json({ message: 'User with this email already exists' })
            }

            const hashedPassword = await bcrypt.hash(password, 12)

            try {

                const user = new User({ name, email, password: hashedPassword, isAdmin: false })

                const token = jwt.sign({ id: user._id }, config.get('secret'), {
                    expiresIn: 86400
                })

                await user.save()

                res.status(201).json({ message: 'User successfully created', auth: true, token })

            } catch(e) {
                return res.status(500).json({ message: "Something went wrong" })
            }
        } catch(e) {
            res.status(500).json({ message: "Something went wrong" })
        }

    }
)

//api/auth/login
router.post(
    '/login',
    [
        check('email', 'Incorrect email format').isEmail()
    ],
    async (req, res) => {
        
        const errors = validationResult(req)

        if(!errors.isEmpty()) {
            return res.status(400).json({ message: 'Wrong authorization' })
        }

        const { email, password } = req.body

        const user = findOne({ email })

        if(!user) {
            return res.status(400).json({ message: 'User with this email does not exist' })
        }

        const isMatch = bcrypt.compare(password, user.password)

        if(!isMatch) {
            return res.status(400).json({ message: 'Wrong password' })
        }

        const token = jwt.sign({ id: user._id }, config.get('secret'), {
            expiresIn: 86400
        })

        res.json({ message: "Authorized", auth: true, token })
    }
)

module.exports = router
