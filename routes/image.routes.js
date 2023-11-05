const router = require('express').Router();
const {upload} = require('../controllers/image.controllers');
const {image} = require('../libs/multer');

router.post('/:id', image.single('image'), upload);

module.exports = router;