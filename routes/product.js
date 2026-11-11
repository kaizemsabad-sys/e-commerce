const express = require('express');
const productController = require('../controllers/product');
const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

router.post("/", verify, verifyAdmin, productController.addProduct);

router.get("/all", verify, verifyAdmin, productController.getAllProducts);
router.get("/active", productController.getAllActive);

router.post("/search-by-name", productController.searchProductsByName);
router.post("/search-by-price", productController.searchProductsByPrice);

router.get("/:productId", productController.getProduct);

router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

module.exports = router;