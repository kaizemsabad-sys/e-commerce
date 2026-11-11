const Product = require("../models/Product");
const auth = require("../auth");

module.exports.addProduct = (req, res) => {
    // Validation: Ensure price is provided and is not negative
    if (!req.body.price || req.body.price < 0) {
        return res.status(400).send({ message: 'Price must be a positive number' });
    }

    let newProduct = new Product({
        name : req.body.name,
        description : req.body.description,
        price : req.body.price
    });

    Product.findOne({name: req.body.name})
    .then(existingProduct => {

        if(existingProduct) {
            return res.status(409).send({ message: "Product already exists"});
        } else {

            return newProduct.save()
            .then(result => {
                res.status(201).send({
                    success: true,
                    message: "Product added successfully",
                    result: result
                })
            })
            .catch(error => {
                auth.errorHandler(error, req, res); // FIXED
            })
        }
    })
    .catch(error => {
        auth.errorHandler(error, req, res); // FIXED
    });
}; 

//[SECTION] Retrieve all Products
module.exports.getAllProducts = (req, res) => {

    return Product.find({})
    .then(result => {

        if(result.length > 0) {

            res.status(200).send(result)

        } else {

            return res.status(404).send({ message: 'No products found'});
        }

    })
    .catch(error => auth.errorHandler(error, req, res)); // FIXED

};

//[SECTION] Retrieve all active Products
module.exports.getAllActive = (req, res) => {

    Product.find({ isActive: true })
    
    .then(result => {

        if (result.length > 0) {

            res.status(200).send(result)

        } else {

            return res.status(404).send({ message: 'No products found' });

        }
    })
  
    .catch(error => auth.errorHandler(error, req, res)); // FIXED

};

module.exports.getProduct = (req, res) => {
    return Product.findById(req.params.productId)
    .then(product => {
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }
        return res.status(200).send(product);
    })
    .catch(error => auth.errorHandler(error, req, res));
};

module.exports.updateProduct = (req, res) => {
    // Validation: Ensure price is provided and is not negative
    if (req.body.price !== undefined && req.body.price < 0) {
        return res.status(400).send({ message: 'Price must be a positive number' });
    }

    const updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    };

    return Product.findByIdAndUpdate(
        req.params.productId,
        updatedProduct,
        { new: true }
    )
    .then(product => {
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }
        return res.status(200).send({
            success: true,
            message: 'Product updated successfully',
            product: product
        });
    })
    .catch(error => auth.errorHandler(error, req, res));
};

module.exports.archiveProduct = (req, res) => {
    return Product.findByIdAndUpdate(
        req.params.productId,
        { isActive: false },
        { new: true }
    )
    .then(product => {
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }
        return res.status(200).send({
            success: true,
            message: 'Product archived successfully',
            product: product
        });
    })
    .catch(error => auth.errorHandler(error, req, res));
};

module.exports.activateProduct = (req, res) => {
    return Product.findByIdAndUpdate(
        req.params.productId,
        { isActive: true },
        { new: true }
    )
    .then(product => {
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }
        return res.status(200).send({
            success: true,
            message: 'Product activated successfully',
            product: product
        });
    })
    .catch(error => auth.errorHandler(error, req, res));
};

module.exports.searchProductsByName = (req, res) => {
    const searchName = req.body.name; 
    
    if (!searchName) {
        return res.status(400).send({ message: 'Please provide a name to search in the request body' });
    }

    return Product.find({ 
        name: { $regex: searchName, $options: 'i' }, 
        isActive: true 
    })
    .then(products => {
        if (products.length === 0) {
            return res.status(404).send({ message: 'No products found matching that name' });
        }
        return res.status(200).send(products);
    })
    .catch(error => auth.errorHandler(error, req, res));
};

module.exports.searchProductsByPrice = (req, res) => {
    const minPrice = Number(req.body.minPrice);
    const maxPrice = Number(req.body.maxPrice);
    const hasMin = req.body.minPrice !== undefined && !isNaN(minPrice);
    const hasMax = req.body.maxPrice !== undefined && !isNaN(maxPrice);

    if (!hasMin && !hasMax) {
        return res.status(400).send({ message: 'Please provide minPrice or maxPrice in the request body' });
    }

    let priceFilter = {};
    if (hasMin) priceFilter.$gte = minPrice;
    if (hasMax) priceFilter.$lte = maxPrice;
    
    return Product.find({ 
        price: priceFilter,
        isActive: true 
    })
    .then(products => {
        if (products.length === 0) {
            return res.status(404).send({ message: 'No products found in this price range' });
        }
        return res.status(200).send(products);
    })
    .catch(error => auth.errorHandler(error, req, res));
};