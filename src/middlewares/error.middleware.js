const errorHandler = (err, req, res,next) => {
    let { statusCode, message ,data} = err;

    res.locals.errorMessage = err.message;

    let response = {
        code: statusCode ?? 500,
        message,
        data : data ?? []
    }
    if(err.message === "Not found") {
        const {stack, ... newResponse} = response;
        response = newResponse;
    }
    res.status(response.code).send(response);
};

export default errorHandler;