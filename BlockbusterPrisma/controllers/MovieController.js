const ResponseObject = require("../helpers/ResponseObject");
const fetch = (url) =>
	import("node-fetch").then(({ default: fetch }) => fetch(url));
const GHIBLI_APP = "https://ghibliapi.herokuapp.com/films/";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// JsonWebToken
const jwt = require("jsonwebtoken");

async function getFilmFromAPIByName(name) {
	let films = await fetch("https://ghibliapi.herokuapp.com/films");
	films = await films.json();
	film = films.find((m) => m.title === name);
	return film;
}

const getMovies = async (req, res) => {
	const { order } = req.query;
	const response = await fetch("https://ghibliapi.herokuapp.com/films");
	const movies = await response.json();
	if (order === "desc") {
		movies.sort((a, b) => b.release_date - a.release_date);
	} else if (order === "asc") {
		movies.sort((a, b) => a.release_date - b.release_date);
	}

	if (movies.length < 1) {
		let error = new Error("Movies not found");
		error.status = 404;
		return next(error);
	}
	res.status(200).json(new ResponseObject("OK", true, 200, [movies]));
};

const getMovieDetails = async (req, res) => {
	try {
		const { id } = req.params;
		let movies = await fetch("https://ghibliapi.herokuapp.com/films");
		movies = await movies.json();
		movies = movies.map((movie) => ({
			id: movie.id,
			title: movie.title,
			description: movie.description,
			director: movie.director,
			producer: movie.producer,
			release_date: movie.producer,
			running_time: movie.running_time,
			rt_score: movie.rt_score,
		}));
		const movie = movies.find((movie) => movie.id === id);
		res.status(200).send(movie);
	} catch (error) {
		let err = new Error();
		error.status = 500;
		return next(error);
	}
};

const getMovieByTitle = async (req, res, next) => {
	const { title } = req.params;

	const response = await fetch("https://ghibliapi.herokuapp.com/films");
	const movies = await response.json();
	const movie = await movies.find((movie) =>
		movie.title.toLowerCase().includes(title)
	);

	if (!movie) {
		let error = new Error("Movie not found");
		error.status = 404;
		return next(error);
	}

	res.status(200).json(movie);
};

const addMovie = async (req, res, next) => {
	
	const { title } = req.body;	
	const movie = await getFilmFromAPIByName(title);
	
	if (!movie) {
		let error = new Error("Incorrect movie name o doesn't exist.");
		error.status(400);
		return next(error);
	}
	const newMovie = {
		code: movie.id,
		title: movie.title,
		stock: 5,
		rentals: 0,
	};
	
	const findedMovie = prisma.movies.findFirst({where: {title : title}})
	
	if(findedMovie){
		let error = new Error("Movie already exist.");
		error.status = 400;
		return next(error);
	}

	prisma.movies
		.create(newMovie)
		.then((movie) => res.status(201).json(new ResponseObject("Movie created succesfully",true,201)))
		.catch((err) => next(err));
}

const addFavourite = async (req, res, next) => {
	try {
		const code = req.params.code;
		const { review } = req.body;
		const verifyFavoriteFilm = await prisma.favoriteFilms.findMany({
			where: {
				id_user: req.user.id,
				id_movie: code,
			},
		});
		if (verifyFavoriteFilm.length > 0)
			return res
				.status(400)
				.json({ errorMessage: "Film already added to favorite" });

		prisma.movies.findUnique({ where: { code: code } }).then((film) => {
			if (!film) throw new Error("Movie not available");

			const newFavouriteFilms = {
				id_movie: film.code,
				id_user: req.user.id,
				review: review,
			};

			prisma.favoriteFilms
				.create({ data: newFavouriteFilms })
				.then((newFav) => {
					if (!newFav) throw new Error("FAILED to add favorite movie");

					res.status(201).send("Movie Added to Favorites");
				});
		});
	} catch (error) {
		return next(error);
	}
};

const allFavouritesMovies = async (req, res, next) => {
	try {
		const { order } = req.query;

		if (!order) order = asc;
		const allFilms = await prisma.favoriteFilms.findMany({
			where: { id_user: parseInt(req.user.id) },
		});

		if (order === "desc") {
			return allFilms.sort((a, b) => b.id - a.id);
		} else if (order === "asc") {
			return allFilms.sort((a, b) => a.id - b.id);
		}

		if (allFilms.length < 1) {
			let error = new Error("Movies not found");
			error.status(404);
			return next(error);
		}
		res.status(200).json(allFilms);
	} catch (error) {
		res
			.status(500)
			.json(new ResponseObject("Internal server error.", false, 500));
	}
};

module.exports = {
	getMovies,
	getMovieDetails,
	addMovie,
	getMovieByTitle,
	addFavourite,
	allFavouritesMovies,
};
