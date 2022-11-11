const jwt = require("jsonwebtoken");
const ResponseObject = require("../helpers/ResponseObject");

const checkLoggedIn = (req, res, next) => {
	const token = req.headers.authorization.split(" ")[1];
	let decoded = jwt.decode(token, { complete: true });
	if (!decoded) {
		let e = new Error("Unauthorized");
		error.status = 401;
		next(error);
	} else {
		next();
	}
};

const checkAdmin = (req, res, next) => {
	const token = req.headers.authorization.split(" ")[1];
	let decoded = jwt.decode(token, { complete: true });
  console.log(decoded)
	if (!decoded || decoded.payload.usuario.role !== "ADMIN") {
		let e = new Error("Forbidden");
		e.status = 403;
		next(e);
	} else {
		next();
	}
};

const checkLoggedUser = (req, res, next) => {
	if (req.headers.authorization === undefined)
		return res.status(401).json(new ResponseObject("Unauthorized", false, 401));
	const token = req.headers.authorization.split(" ")[1];
	let decoded = jwt.decode(token, { complete: true });

	if (!decoded) {
		const e = new Error("Unauthorized");
    e.status = 401
		return next(e);
	} else {
		req.user = decoded.payload.usuario;
		return next();
	}
};

module.exports = {
	checkAdmin,
	checkLoggedIn,
	checkLoggedUser,
};
