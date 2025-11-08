const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'secret.env'});

const router = express.Router();


router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email']})
);

router.get('/google/callback',
    passport.authenticate('google', {failureRedirect: '/', session: false}),
    (req, res) => {
        const user = req.user;

        const token = jwt.sign(
        {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        
        process.env.JWT_SECRET,
        {expiresIn: '1d'}
        );
        
        res.redirect(`http://localhost:4200/login-success?token=${token}`)

    }
);

module.exports = router;