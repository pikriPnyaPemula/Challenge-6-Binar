const router = require('express').Router();
const {uploadImage, getImageById, getImageDetail, deleteImage, updateImage} = require('../controllers/image.controllers');
const {image} = require('../libs/multer');

router.post('/:id', image.single('image'), uploadImage);
router.get('/:id', getImageById);
router.get('/detail/:id', getImageDetail);
router.delete('/:id', deleteImage);
router.put('/:id', image.single('image'), updateImage);

module.exports = router;