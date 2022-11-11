const { PrismaClient } = require("@prisma/client");
const ResponseObject = require("../helpers/ResponseObject")
const prisma = new PrismaClient();

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
    if (verifyFavoriteFilm.length > 0){
      let error = new Error("Film already added to favorite");
      error.status = 400;
      return next(error);
    }
    
    prisma.movies.findUnique({ where: { code: code } }).then((film) => {
      if (!film) throw new Error("Movie not avaliable ");

      const newFavouriteFilms = {
        id_movie: film.code,
        id_user: req.user.id,
        review: review,
      };

      prisma.favoriteFilms
        .create({ data: newFavouriteFilms })
        .then((newFav) => {
          if (!newFav) {
            let error =  new Error("Failed to add a favorite movie");
          error.status = 500;
          }

          res.status(201).json(new ResponseObject("Movie Added to Favorites",true,201));
        });
    });
  } catch (error) {
    (error) => next(error);
  }
};

const allFavouritesMovies = async (req, res, next) => {
  try {
    let { order } = req.query;

    let allFilms = await prisma.favoriteFilms.findMany({
      where: { id_user: req.user.id },
    });

    if (order === "desc") {
      allFilms.sort((a, b) => b.id - a.id);
    } else if (order === "asc") {
      allFilms.sort((a, b) => a.id - b.id);
    }

    allFilms.length > 0
      ? res.status(200).json(allFilms)
      : res.status(404).json( new ResponseObject("Movies not found",false,404));
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  addFavourite,
  allFavouritesMovies,
};
