// batter way to write try and catch

function wrapAsync(fn) {
    return function (req, res, next) {
        fn (res, res, next).catch(next);
    };
};

module.exports = wrapAsync();