const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const imagekit = require('../libs/imagekit');
const path = require('path');

module.exports = {
    uploadImage: async (req, res, next) => {
        try{
            let{id} = req.params;
            let {title, desc} = req.body;

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

            let upload = await prisma.image.create({
                data: {title, desc, upload_picture: url, user: {connect: {id: Number(id)}}}
            });

            res.status(200).json({
                status: true,
                message: 'OK',
                err: null,
                data: {
                    file_url: url,
                    upload
                }
            });
        }catch(err){
            next(err);
        }
    },

    getImageById: async (req, res, next)=>{
        try{
            let {id} = req.params;
                let image = await prisma.image.findMany({where: {user_id: Number(id)}});

                return res.status(200).json({
                    status: true,
                    message: 'OK',
                    err: null,
                    data: {image}
                })
        } catch(err){
            next(err);
        }
    },

    getImageDetail: async (req, res, next)=>{
        try{
            let{id} = req.params;
            let image = await prisma.image.findUnique({where: {id: Number(id)}});

            return res.status(200).json({
                status: true,
                message: 'OK',
                err: null,
                data: {image}
            })
        } catch(err){
            next(err);
        }
    },

    deleteImage: async (req, res, next)=>{
        try{
            let{id} = req.params;
            let deleteimage = await prisma.image.delete({where: {id: Number(id)}});

                res.status(200).json({
                    status: true,
                    message: 'OK',
                    err: null,
                    data: {deleteimage}
                });
        }catch(err){
            next(err);
        }    
    }
};