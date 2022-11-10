const express = require("express");
const router = express.Router();
const MovieController = require("./controllers/MovieController");
const UsersController = require("./controllers/UserController");
const { checkLoggedIn, checkLoggedUser } = require("./middlewares/checks");
const RentController = require("./controllers/RentController");
const FavoritesController = require("./controllers/FavoritesController")


router.get("/movies/:id", MovieController.getMovieDetails);
router.get("/movies", MovieController.getMovies);
router.get("/movies/title/:title", MovieController.getMovieByTitle);
router.get("/favourites", checkLoggedUser, FavoritesController.allFavouritesMovies);
router.get("/logout", checkLoggedUser, UsersController.logout);
router.get("/login", (req, res) => res.send("You must be logged in"));
router.get('/rent/user', checkLoggedUser, RentController.rentsByUser)
router.get('/rents/all', RentController.getAllRents)
router.post("/favourites/:code",checkLoggedUser, FavoritesController.addFavourite);
router.post("/login", UsersController.login);
router.post("/register", UsersController.register);
router.post("/movie", checkLoggedIn, MovieController.addMovie);
router.post("/rent/:code", checkLoggedUser, RentController.rentMovie);
router.put("/rent/:id",checkLoggedUser, RentController.returnRent);


module.exports = router;
