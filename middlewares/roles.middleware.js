exports.commonRoute = function (req, res, next) {
    const user = req.user;
    if (user.role == "admin" || user.role == "user" || user.role == "employee") {
        next();
        return;  
    }
    res.redirect("/unauthorized");
}


exports.adminRoute = function (req, res, next) {
    const user = req.user;
    if (user.role == "admin") {
        next();
        return;  
    }
    res.redirect("/unauthorized");
}

exports.userRoute = function (req, res, next) {
    const user = req.user;
    if (user.role == "user" || user.role == "admin") {
        next();
        return;  
    }
    res.redirect("/unauthorized");
} 

exports.employeeRoute = function (req, res, next) {
    const user = req.user;
    if (user.role == "employee" || user.role == "user" || user.role == "admin") {
        next();
        return;  
    }
    res.redirect("/unauthorized");
} 