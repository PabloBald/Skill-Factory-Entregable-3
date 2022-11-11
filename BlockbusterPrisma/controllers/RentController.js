const { PrismaClient } = require("@prisma/client");
const { rentPrice } = require("../helpers/rentPrice");
const prisma = new PrismaClient();

const getAllRents = async (req, res,next) => {
  try {
    let { order } = req.query;

    order ? (order = order) : (order = "asc");

    let rents = await prisma.rents.findMany();

    if (order === "asc") {

      rents.sort((a, b) => a.id_rent - b.id_rent)

    } else if (order === "desc") {

      rents.sort((a, b) => b.id_rent - a.id_rent)
    }

    if(rents.length<1){
      let error = new Error("Rents not found.");
      error.status = 404;
      return next(error);
    }
    res.status(200).json(rents)
  } catch (error) {
    let err = new Error();
    err.status = 500;
    return next(err);
  }
};
const rentMovie = async(req, res, next) => {
  try {
    const { _code } = req.params;

    let rents= await prisma.rents
      .findMany({ where: { id_user: req.user.id,userRefund_date: null,code: _code} })
    if(rents){
      let error = new Error("Can't rent a movie twice.");
      error.status = 400;
      return next(error);
    }

  prisma.movies.findUnique({ where: { code: _code } }).then((rental) => {
    if (!rental) {
      let error = new Error("Movie not found")
      error.status = 400;
      return next(error);
    }

    if (rental.stock === 0) {
        let error = new Error("Movie not available")
        error.status = 400;
        return next(error);
    }

    prisma.rents
      .create({
        data: {
          code: rental.code,
          id_user: req.user.id,
          rent_date: new Date(Date.now()),
          refund_date: new Date(Date.now() + 3600 * 1000 * 24 * 7),
        },
      })
      .then((data) => {
        prisma.movies
          .update({
            data: { stock: rental.stock - 1, rentals: rental.rentals + 1 },
            where: { code: rental.code },
          })
          .then(() => res.status(201).send(data));
      });
  });
  } catch (error) {
    let err = new Error("Internal server error");
    err.status = 500;
    return next(err);
  }
  
};

//Function to add 10% of the original price for each day late.
const lateRefund = async (originalPrice, daysLate) => {
  let finalPrice = originalPrice;

  for (let i = 0; i < daysLate; i++) {
    finalPrice += finalPrice * 0.1;
  }

  return finalPrice;
};
const rentsByUser = async (req, res, next) => {
  try {
    let { order } = req.query;

    order ? (order = order) : (order = "asc");
    let allHistoryRent= await prisma.rents
      .findMany({ where: { id_user: req.user.id } })
      //Aca deberia filtrar las tienen userRefund_date en null y mostrarlas
      let rentsbyuser=allHistoryRent.filter(rent=>rent.userRefund_date===null)
    
      if (order === "asc") {

        rentsbyuser.sort((a, b) => a.rent_date - b.rent_date)
  
      } else if (order === "desc") {
  
        rentsbyuser.sort((a, b) => b.rent_date - a.rent_date)
      }
      if(rentsbyuser.length < 1){
        let err = new Error("Movies not found");
        err.status = 404;
        return next(err);
      }
      res.status(200).json(rentsbyuser)
  } catch (error) {
    console.log(error);
    res.status(500).send("Service unavailable");
  }
};

const returnRent = async (req, res) => {
  try {
    let { id } = req.params;
    id = parseInt(id);

    const rent = await prisma.rents.findUnique({
      where: {
        id_rent: id,
      },
    });

    if (!rent){
      let error = new Error("Rent not found");
      error.status = 404;
      return next(error);
    }

    rent.userRefund_date = new Date();

    const movie = await prisma.movies.findUnique({
      where: {
        code: rent.code,
      },
    });

    movie.stock++;

    await prisma.movies.update({
      where: {
        code: movie.code,
      },
      data: {
        stock: movie.stock,
      },
    });

    await prisma.rents.update({
      where: {
        id_rent: id,
      },
      data: {
        userRefund_date: rent.userRefund_date,
      },
    });

    res.status(200).json({
      message: "The movie was returned",
      price: rentPrice(rent.userRefund_date, rent.refund_date),
    });
    //await prisma.rents.delete({ where: { id_rent: id } });
  } catch (error) {
    let err = new Error();
    err.status = 500;
    return next(err);
  }
};
module.exports = {
  rentMovie,
  rentsByUser,
  returnRent,
  getAllRents
};
