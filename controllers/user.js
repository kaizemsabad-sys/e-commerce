const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../auth.js');
const { errorHandler } = require('../auth');

// Register User
module.exports.registerUser = (req, res) => {
    if (!req.body.email || !req.body.email.includes('@')) {
        return res.status(400).send({ message: 'Invalid email format' });
    }

    if (!req.body.password || req.body.password.length < 8) {
        return res.status(400).send({ message: 'Password must be at least 8 characters long' });
    }

    if (!req.body.mobileNo || req.body.mobileNo.length !== 11) {
        return res.status(400).send({ message: 'Invalid mobile number' });
    }

    return User.findOne({ email: req.body.email })
    .then(existingUser => {
        if (existingUser) {
            return res.status(409).send({ message: 'Email already registered' });
        }

        let newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            mobileNo: req.body.mobileNo,
            password: bcrypt.hashSync(req.body.password, 10)
        });

        return newUser.save()
        .then(savedUser => {
            return res.status(201).send({
                message: 'Registered successfully',
                user: {
                    id: savedUser._id,
                    email: savedUser.email
                }
            });
        });
    })
    .catch(error => auth.errorHandler(error, req, res));
};

// Login user
module.exports.updatePassword = (req, res) => {
    const newPassword = req.body.newPassword  req.body.password;

    if (!newPassword  newPassword.length < 8) {
        return res.status(400).send({ message: 'Password must be at least 8 characters long' });
    }

    return User.findById(req.user.id)
    .then(user => {
        if (!user) return res.status(404).send({ message: 'User not found' });

        user.password = bcrypt.hashSync(newPassword, 10);
        return user.save()
        .then(() => res.status(200).send({ message: 'Password updated successfully' }));
    })
    .catch(error => auth.errorHandler(error, req, res));
};


// Check Email Exists
module.exports.checkEmailExists = (req, res) => {
    return User.findOne({ email: req.body.email })
    .then(user => {
        if (user) {
            return res.status(200).send({ exists: true });
        } else {
            return res.status(404).send({ exists: false });
        }
    })
    .catch(error => auth.errorHandler(error, req, res));
};

// Get User Profile Details
module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id)
    .then(user => {
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        user.password = undefined;
        return res.status(200).send({ user });
    })
    .catch(error => auth.errorHandler(error, req, res));
};

// Update Password
module.exports.updatePassword = (req, res) => {
    const newPassword = req.body.newPassword || req.body.password;

    if (!newPassword || newPassword.length < 8) {
        return res.status(400).send({ message: 'Password must be at least 8 characters long' });
    }

    return User.findById(req.user.id)
    .then(user => {
        if (!user) return res.status(404).send({ message: 'User not found' });

        user.password = bcrypt.hashSync(newPassword, 10);
        return user.save()
        .then(() => res.status(200).send({ message: 'Password updated successfully' }));
    })
    .catch(error => auth.errorHandler(error, req, res));
};

// Set User as Admin
module.exports.setAsAdmin = (req, res) => {
    return User.findByIdAndUpdate(req.params.id, { isAdmin: true }, { new: true })
    .then(updatedUser => {
        if (!updatedUser) return res.status(404).send({ message: 'User not found' });
        updatedUser.password = undefined; // Hide password
        return res.status(200).send({
            success: true,
            message: 'User updated to admin successfully',
            user: updatedUser // Return the updated user data
        });
    })
    .catch(error => auth.errorHandler(error, req, res));
};