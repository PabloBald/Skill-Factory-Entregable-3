const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ResponseObject = require("../helpers/ResponseObject");

const login = (req, res, next) => {
	try {
		let { email, password } = req.body;
		if (!email || !password) {
			res.status(400).json({ errorMessage: "All fields are required" });
		} else {
			let { email, password } = req.body;
			prisma.user
				.findUnique({ where: { email: email } })
				.then((usuarioDB) => {
					if (!usuarioDB) {
						let error = new Error("Usuario o contraseña incorrectos");
						error.status = 400;
						return next(error);
					}
					// Validates that the password typed by the user is the one stored in the db.
					if (!bcrypt.compareSync(password, usuarioDB.password)) {
						let error = new Error("Usuario o contraseña incorrectos");
						error.status = 400;
						return next(error);
					}
					// Generate authentication token
					let token = jwt.sign(
						{
							usuario: usuarioDB,
						},
						process.env.SEED_AUTENTICACION,
						{
							expiresIn: process.env.CADUCIDAD_TOKEN,
						}
					);
					res.json({
						ok: true,
						usuario: usuarioDB,
						token,
					});
				})
				.catch((error) => next(error));
		}
	} catch (error) {
		let err = new Error();
		error.status = 500;
		return next(err);
	}
};

const register = async (req, res, next) => {
	try {
		let { email, password, dni, phone } = req.body;

		if (!email || !password || !dni || !phone) {
			let error = new Error("All fields are required");
			error.status = 400;
			return next(error);
		}
		const verifyUser = await prisma.user.findMany({ where: { email: email } });
		console.log(verifyUser);

		if (verifyUser.length > 0) {
			let error = new Error("Email, dni or phone is already in use");
			error.status = 400;
			return next(error);
		}

		let usuario = {
			email,
			dni,
			phone,
			password: bcrypt.hashSync(password, 10),
		};

		prisma.user.create({ data: usuario }).then((usuarioDB) => {
			return res
				.status(201)
				.json({
					ok: true,
					usuario: usuarioDB,
				})
				.end();
		});
	} catch (error) {
		let err = new Error();
		error.status = 500;
		return next(err);
	}
};

const logout = (req, res, next) => {
	try {
		req.user = null;
		res.status(200).json(new ResponseObject("Logged out.", true, 200));
	} catch (error) {
		res
			.status(500)
			.json(new ResponseObject("Internal server error", false, 500));
	}
};
module.exports = {
	login,
	register,
	logout,
};
