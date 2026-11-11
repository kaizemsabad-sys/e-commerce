const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { errorHandler } = require('../auth');

// [Section] Add to Cart
module.exports.addToCart = (req, res) => {
	if (req.user.isAdmin === true) {
		return res.status(403).send({ message: 'Action Forbidden. Admins cannot add items to a cart'});
	}

	const userId = req.user.id;
	const { productId, quantity } = req.body;

	if (!productId || quantity === undefined) {
        return res.status(400).send({ message: 'Product ID and quantity are required' });
	}

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).send({ message: 'Quantity must be a positive integer' });
	}

	return Product.findById(productId)
	.then(product => {
		if(!product || !product.isActive) {
			return res.status(404).send({ message: "Product not found or inactive"});
		}
		const subtotal = product.price * qty;

		return Cart.findOne({ userId: userId})
		.then(cart => {
			if(!cart) {
				let newCart = new Cart({
					userId: userId,
					cartItems: [{ productId, quantity: qty, subtotal }],
					totalPrice: subtotal
				});

				return newCart.save()
				.then(savedCart => res.status(201).send({
					message: 'Item added to cart successfully',
					cart: savedCart
				}))
				.catch(error => errorHandler(error, req, res));
            } // <-- CRITICAL FIX: This closing brace was missing in your code!

			const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

			if (itemIndex > -1) {
				cart.cartItems[itemIndex].quantity += qty;
				cart.cartItems[itemIndex].subtotal = cart.cartItems[itemIndex].quantity * product.price
			} else {
				cart.cartItems.push({ productId, quantity: qty, subtotal });
			}

			cart.totalPrice = cart.cartItems.reduce((sum, item) => sum + item.subtotal, 0);

			return cart.save()
			.then(updatedCart => res.status(200).send({
				message: "Cart updated successfully",
				cart: updatedCart
			}))
            .catch(error => errorHandler(error, req, res));
        })
        .catch(error => errorHandler(error, req, res));
    })
    .catch(error => errorHandler(error, req, res));
};

//[SECTION] Retrieve Cart Workflow
module.exports.getCart = (req, res) => {
	if(req.user.isAdmin) {
		return res.status(403).send({ message: 'Action Forbidden. Admins cannot view a shopping cart' })
	}

	const userId = req.user.id;

	return Cart.findOne({ userId: userId })
	.then(cart =>{
		if(!cart) {
			return res.status(404).send({message: 'No cart found for this user'});
		}

		return res.status(200).send({ cart: cart });
	})
	.catch(error => errorHandler(error, req, res));
};

//[SECTION] Update Cart Quantity
module.exports.updateCartQuantity = (req, res) => {
    if (req.user.isAdmin) {
        return res.status(403).send({ message: 'Action Forbidden. Admins cannot modify a shopping cart' });
    }

    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || quantity === undefined) {
        return res.status(400).send({ message: 'Product ID and quantity are required' });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).send({ message: 'Quantity must be a positive integer' });
    }

    // Find the user's cart
    return Cart.findOne({ userId: userId })
    .then(cart => {
        if (!cart) {
            return res.status(404).send({ message: 'No cart found for this user' });
        }

        // Check if product exists in cartItems
        const itemIndex = cart.cartItems.findIndex(
            item => item.productId.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).send({ message: 'Item not found in cart' });
        }

        // Fetch the product to use the current price for the subtotal
        return Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.status(404).send({ message: 'Product not found' });
            }

            cart.cartItems[itemIndex].quantity = qty;
            cart.cartItems[itemIndex].subtotal = product.price * qty;

            cart.totalPrice = cart.cartItems.reduce((sum, item) => sum + item.subtotal, 0);

            return cart.save()
            .then(updatedCart => res.status(200).send({
                message: 'Cart item quantity updated successfully',
                cart: updatedCart
            }))
            .catch(error => errorHandler(error, req, res));
        })
        .catch(error => errorHandler(error, req, res));
    })
    .catch(error => errorHandler(error, req, res));
};

// [SECTION] Remove from Cart
module.exports.removeFromCart = (req, res) => {
	if(req.user.isAdmin === true) {
        return res.status(403).send({ message: 'Action Forbidden. Admins cannot modify a shopping cart' }); 
    }
    
	const userId = req.user.id;
	const { productId } = req.params;

	return Cart.findOne({ userId: userId })
	.then(cart => {
		if(!cart) {
			return res.status(404).send({ message: 'No cart found'});
		}

		const itemIndex = cart.cartItems.findIndex(
			item => item.productId.toString() === productId
		);

		if(itemIndex > -1) {
			cart.cartItems.splice(itemIndex, 1);

			cart.totalPrice = cart.cartItems.reduce((sum, item) => sum + item.subtotal, 0);

			return cart.save()
			.then(updatedCart => {
				return res.status(200).send({  
					message: 'Item successfully removed', 
					cart: updatedCart
				});
			})
			.catch(error => errorHandler(error, req, res));
		} else {
			return res.status(404).send({ message: 'Item not found in cart'});
		}
	})
	.catch(error => errorHandler(error, req, res));
};

// [SECTION] Clear Cart
module.exports.clearCart = (req, res) => {
	if(req.user.isAdmin === true) {
		return res.status(403).send({ message: "Action Forbidden. Admins cannot modify a shopping cart" });
	}

	const userId = req.user.id

	return Cart.findOne({ userId: userId })
	.then(cart => {
		if(!cart){
			return res.status(404).send({ message: "No cart found for this user" });
		}

		if(cart.cartItems.length > 0) {
			cart.cartItems = [];
			cart.totalPrice = 0;

			return cart.save()
			.then(updatedCart => {
				return res.status(200).send({
					message: 'Cart cleared successfully',
					cart: updatedCart
				});
			})
			.catch(error => errorHandler(error, req, res));
		} else {
			return res.status(400).send({ message: "Cart is already empty"});
		}
	})
	.catch(error => errorHandler(error, req, res));
};