const errorLogger = (error, req, res, next) => {
  console.error(error);
  next(error)
}

const errorParser = (error, req, res, next) => {
  console.log("asd")
  if(error.status === 404) {
    res.status(404).json({ok: false,message: error.message,status: error.status});
  } else if (error.status === 400 || error.errors.find(err => err.type === "notNull Violation")){
    res.status(400).send("BAD REQUEST")
  }
    
  else if (error.status === 400 || error.code === 'P2002') {
    res.status(400).send("BAD REQUEST")
  }
  else {
    res.status(500).send("Server ERROR")
  }
}

const notFound = (req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    return next(err); 
  }

const errorHandler = {
  errorLogger,
  errorParser,  
  notFound
}

module.exports = errorHandler;