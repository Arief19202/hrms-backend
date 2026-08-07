const errorHandler = (err, req, res, next) => {
    console.error("API Error caught in errorHandler:", err);

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });

};

module.exports = errorHandler;