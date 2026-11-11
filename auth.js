const jwt = require("jsonwebtoken");

require('dotenv').config();

//[SECTION] JSON Web Tokens

module.exports.createAccessToken = (user) => {

	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	}

	return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
}

//[SECTION] Token Verification
module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization);

	
	let token = req.headers.authorization;

	
	if(typeof token === "undefined") {
    return res.status(401).send({ auth: "Failed. No Token"})
} else {
		console.log(token);
		token = token.slice(7, token.length);
		console.log(token);	

		//[SECTION] Token Decryption
		
		jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken) {

			if(err) {
				return res.status(403).send({
					auth: "Failed",
					message: err.message
				})
			} else {

				//contains the data from our token
				console.log("Result from verify method:");
				console.log(decodedToken);

				// Else, if our token is verified to be correct, then we will update the request and add the user's decoded details
				req.user = decodedToken;

				next();
			}
		})
	}
}


module.exports.verifyAdmin = (req, res, next) => {

	console.log("result from verifyAdmin method");
	console.log(req.user);

	if(req.user.isAdmin) {

		next();
	} else {

		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		});
	}
}

//[SECTION] error Handler
module.exports.errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: { message: err.message, errorCode: 'VALIDATION_ERROR', details: null }
        });
    }

    // Add this check for bad MongoDB IDs
    if (err.name === 'CastError') {
        return res.status(400).json({
            error: {
                message: 'Invalid ID format provided.',
                errorCode: 'BAD_REQUEST',
                details: err.message
            }
        });
    }

    const statusCode = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: {
            message: errorMessage,
            errorCode: err.code || 'SERVER_ERROR',
            details: err.details || null
        }
    });
};


//[SECTION] Middleware to check if the user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
	if(req.user) {
		next();
	} else {
		res.status(401).send(false);
	}
}