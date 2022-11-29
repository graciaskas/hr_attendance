exports.logger = function (req, res, next) {
    const date = new Date();
    const { method } = req;
    const { statusCode } = res;


    console.log(
        `${req.ip} - [${method}] ${statusCode} ${req.originalUrl || req.url}`
    );
    next();
}