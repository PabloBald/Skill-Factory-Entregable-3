const ResponseObject = require("../helpers/ResponseObject");

const errorLogger = (error, req, res, next) => {
	console.error(error);
	next(error);
};

const errorParser = (error, req, res, next) => {
	if (error.status === 404) {
		return res.status(404).json(new ResponseObject(error.message, false, 404));
	}
  if (error.status === 400) {
		return res.status(400).send(new ResponseObject(error.message, false, 400));
	}
  if (error.status === 401) {
		return res.status(401).send(new ResponseObject(error.message, false, 401));
	}
  if (error.status === 403) {
		return res.status(403).send(new ResponseObject(error.message, false, 403));
	}

  if(error.status === 500){
		return res.status(500).send(new ResponseObject("Internal server error", false, 500));
	}
};

const notFound = (req, res, next) => {
	const err = new Error("Not Found");
	err.status = 404;
	return next(err);
};

const errorHandler = {
	errorLogger,
	errorParser,
	notFound,
};

module.exports = errorHandler;
