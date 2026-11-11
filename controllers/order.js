const Order = require("../models/Order");
const Cart = require("../models/Cart");
const auth = require("../auth");

// [SECTION] Checkout (Create Order)
module.exports.checkout = (req, res) => {
    if (req.user.isAdmin === true) {
        return res.status(403).send({ message: 'Action Forbidden. Admins cannot checkout' });
    }

    const userId = req.user.id;

    return Cart.findOne({ userId: userId })
    .then(cart => {
        if (!cart) {
            return res.status(404).send({ message: 'No cart found for this user' });
        }

        if (cart.cartItems.length > 0) {
            let newOrder = new Order({
                userId: userId,
                productsOrdered: cart.cartItems,
                totalPrice: cart.totalPrice
            });

            return newOrder.save()
            .then(savedOrder => {
                return Cart.findByIdAndDelete(cart._id)
                .then(() => {
                    return res.status(201).send({
                        message: 'Order created successfully',
                        order: savedOrder
                    });
                });
            })
            .catch(error => auth.errorHandler(error, req, res));
        } else {
            return res.status(400).send({ message: 'Cart is empty. Cannot checkout.' });
        }
    })
    .catch(error => auth.errorHandler(error, req, res));
};

// [SECTION] Retrieve All Orders (Admin Only)
module.exports.getAllOrders = (req, res) => {
    return Order.find({})
    .then(orders => {
        if (orders.length > 0) {
            return res.status(200).send(orders);
        } else {
            return res.status(404).send({ message: 'No orders found' });
        }
    })
    .catch(error => auth.errorHandler(error, req, res));
};

// [SECTION] Retrieve All User's Orders (Teammate's Part)
module.exports.getMyOrders = (req, res) => {
    if (req.user.isAdmin === true) {
        return res.status(403).send({ message: "Action Forbidden, Admins cannot view personal order history" });
    }

    const userId = req.user.id;

    return Order.find({ userId: userId })
    .then(orders => {
        return res.status(200).send({ orders: orders });
    })
     .catch(error => auth.errorHandler(error, req, res));

}; 