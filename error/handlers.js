const logErrorMiddleware = (err, req, res, next) => {
    console.error(err);
    next(err);
}

const validationErrorHandler = (err, req, res, next) => {
    if (err.errors) {
        return res.status(400).json({
            message: 'validation error',
            data: err.errors,
        })
    }
    next(err);
}

const defaultErrorHandler = (err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
}

module.exports = {
    logErrorMiddleware,
    validationErrorHandler,
    defaultErrorHandler
}