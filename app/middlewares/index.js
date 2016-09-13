
function auth(req, res, next) {
    console.log("auth MiddleWare");
    next();
} 

function limitUserCount(req, res, next) {
    console.log("limitUserCount middleware");
    next();
}

module.exports = { auth, limitUserCount };