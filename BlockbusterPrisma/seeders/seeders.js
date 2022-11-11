const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const axios = require("axios");
async function seedAdmin() {
	const admin = {
		email: "admin@admin.com",
		password: await bcrypt.hashSync("admin", 10),
		phone: "777-777-777",
		dni: "77777777",
		role: "ADMIN",
	};

	const user = await prisma.user.create({
		data: admin,
	});
}
async function fetchMovies() {
	const response = axios.get("https:ghibliapi.herokuapp.com/films");
	const data = await response;

	const COMMON_DATA = {
		stock: 5,
		rentals: 0,
		createdAt: new Date().toLocaleDateString(),
		updatedAt: new Date().toLocaleDateString(),
	};

	let movieArray = data.data?.map((movie) => ({
		code: movie.id,
		title: movie.title,
		...COMMON_DATA,
	}));

	movieArray = movieArray.filter((m) => m.title != "Ponyo");

	const upload = async () => {
		const a = await prisma.movies.createMany({
			data: movieArray,
		});
	};

	upload();
}

fetchMovies();
seedAdmin();
console.log("Db seeded succesfully");
