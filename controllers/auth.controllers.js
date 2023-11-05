const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY} = process.env;
const path = require('path');
const imagekit = require('../libs/imagekit');

module.exports = {
    register: async (req, res, next)=>{
        try{
            let {email, password} = req.body;

            let userExist = await prisma.user.findUnique({where: {email}});
            if(userExist){
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'User has already exist',
                    data: null
                });
            }

            let encryptedPassword = await bcrypt.hash(password, 10);
            let user = await prisma.user.create({
                data: {email, password: encryptedPassword}
            });

            return res.status(201).json({
                status: true,
                message: 'Created!',
                err: null,
                data: {user}
            })
        } catch(err){
            next(err);
        }
    },

    login: async (req, res, next)=>{
        try{
            let {email, password} = req.body;

            let user = await prisma.user.findUnique({where: {email}});
            if(!user){
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'Invalid email or password',
                    data: null
                });
            }

            let ifPasswordCorrect = await bcrypt.compare(password, user.password);
            if(!ifPasswordCorrect){
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'Invalid email or password',
                    data: null
                });
            }

            let token = jwt.sign({id: user.id}, JWT_SECRET_KEY);
            return res.status(200).json({
                status: true,
                message: 'OK',
                err: null,
                data: {user, token}
            });
        } catch(err){
            next(err);
        }
    },

    authenticate: async (req, res, next)=>{
        try{
            const userProfile = await prisma.userProfile.findUnique({where: {user_id: req.user.id}});
            return res.status(200).json({
                status: true,
                message: 'OK',
                err: null,
                data: {
                    name: userProfile.name,
                    birth_date: userProfile.birth_date,
                    profile_picture: userProfile.profile_picture,
                    email: req.user.email
                }
            });
        } catch(err){
            next(err);
        }
    },
    
    updateProfile: async (req, res, next)=>{
        try{
            let{id} = req.params;
            let{name, birth_date} = req.body;

            const userExist = await prisma.user.findUnique({where : {id: Number(id)}});
            if(!userExist){
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'User not found',
                    data: null
                })
            }

            let strFile = req.file.buffer.toString('base64');
            let {url} = await imagekit.upload({
                fileName: Date.now() + path.extname(req.file.originalname),
                file: strFile
            });

            let updateOperation = await prisma.userProfile.upsert({
                where: {user_id: Number(id)},
                update: {name, birth_date, profile_picture: url},
                create: {user_id: Number(id), name, birth_date, profile_picture: url}
            });

            res.status(200).json({
                status: true,
                message: 'OK',
                err: null,
                data: {
                    updateOperation
                }
            });
        }catch(err){
            next(err);
        }
    }
};