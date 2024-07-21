const express = require('express')
const { Product } = require('../schema/product')
const { body, validationResult } = require('express-validator')
const router = express.Router()
const multer = require('multer');
const path = require('path')
const bodyParser = require('body-parser');
const fs = require('fs');
const { specificFileTypes, fileRequired, fileSize } = require('../utils/validation');

const uploadPath = path.join(__dirname, '..', 'uploads')

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(__dirname, '..', 'uploads');
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const timestamp = Date.now();
            const originalName = file.originalname;
            const extension = path.extname(originalName);
            const newFilename = `${path.basename(originalName, extension)}_${timestamp}${extension}`;
            cb(null, newFilename);
        }
    }),
});

router.post(
    "/",
    bodyParser.urlencoded({ extended: false }),
    upload.single('image'),
    [
        body('name').notEmpty().withMessage('required'),
        body('description').notEmpty().withMessage('required'),
        body('price').isInt({ min: 0 }).withMessage('must be non negative'),
        body('image')
            .custom(fileRequired)
            .custom(specificFileTypes(['image/png', 'image/jpeg', 'image/jpg']))
            .custom(fileSize(500 * 1024))
    ],
    async(req, res, next) => {
        try {
            validationResult(req).throw()
            const { name, price, description } = req.body
        
            const product = await Product.create({
                name: name,
                price: price,
                description: description,
                imageUrl: `/uploads/${req.file.filename}`,
            })
        
            return res.status(201).send({ message: 'success', data: { id: product._id } })
        } catch (e) {
            if (req.file.filename) {
                fs.unlinkSync(path.join(uploadPath, req.file.filename))
            }
            next(e)
        }
})

module.exports = router