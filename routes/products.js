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

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve all products
 *     description: Get a list of all products in the database
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 60d5ecb54b24e1234567890a
 *                       name:
 *                         type: string
 *                         example: Product Name
 *                       description:
 *                         type: string
 *                         example: Product Description
 *                       price:
 *                         type: number
 *                         example: 99.99
 *                       imageUrl:
 *                         type: string
 *                         example: /uploads/product_image.jpg
 *       500:
 *         description: Server error
 */
router.get("/", async(req, res, next) => {
    try {
        const products = await Product.find()
    
        return res.status(200).send({ message: 'success', data: products.map(product => ({
            id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl
        })) })
    } catch (e) {
        next(e)
    }
})

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     description: Add a new product with name, description, price, and image
 *     tags: [Products]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: Name of the product
 *       - in: formData
 *         name: description
 *         type: string
 *         required: true
 *         description: Description of the product
 *       - in: formData
 *         name: price
 *         type: integer
 *         required: true
 *         description: Price of the product (non-negative)
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Product image (PNG, JPEG, JPG, max 500KB)
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60d5ecb54b24e1234567890a
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
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