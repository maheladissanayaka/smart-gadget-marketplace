// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getTopProducts, getAllProducts, searchProducts, getProductById, addProduct, updateProduct, deleteProduct, getProductsBySeller } = require('../controllers/productController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), addProduct);
router.put('/:id', upload.single('image'), updateProduct);

// Route: GET /api/products/top
router.get('/top', getTopProducts);

router.get('/search', searchProducts);
router.get('/:id', getProductById);
// Route: GET /api/products
router.get('/', getAllProducts);

router.post('/', addProduct);

router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

router.get('/seller/:sellerId', getProductsBySeller);

module.exports = router;