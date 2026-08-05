/**
 * auth.js
 * Handles user registration and login.
 * Returns JWT tokens after successful authentication.
 */

const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// POST /api/auth/register
// Creates a new user
router.post('/register', async (req,res)=>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user =
            new User({
                username:req.body.username,
                password:hashedPassword,
                role:req.body.role || 'public'
            });

        await user.save();

        res.status(201).json({message:'User created'});
    }

    catch(err){
        res.status(400).json({error:err.message});
    }
});

// POST /api/auth/login
// Returns JWT token
router.post('/login', async(req,res)=>{
    try {
        const user = await User.findOne({username:req.body.username});

        if(!user){
            return res.status(401).json({error:'Invalid credentials'});
        }

        const valid = await bcrypt.compare(req.body.password, user.password);

        if(!valid){
            return res.status(401).json({error:'Invalid credentials'});
        }

        const token =
            jwt.sign({id:user._id, username:user.username, role:user.role},
                process.env.JWT_SECRET, {expiresIn:'2h'}
            );

        res.json({token, role:user.role});
    }

    catch(err){
        res.status(500).json({error:'Server error'});
    }
});

module.exports = router;