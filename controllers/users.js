const User = require("../models/user.js");

module.exports.renderSignUpForm =  (req, res) => {
    res.render("users/signUp.ejs");
};

module.exports.signUp = async(req,res) =>{
    try{
        let { username, email, password } = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        //Auto login after sign up passport method
        req.login( registeredUser, (err) => {
            if(err){
                return next(err);
            }
            req.flash("success", "Wellcome to WanderLust");
            res.redirect("/listings");
        });
    }catch(err){
        req.flash("error" , err.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm =  (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async(req, res) => {
    req.flash("success", "Wellcome Back to wandelust");
    //let redirectUrl = req.locals.redirectUrl || "/listings";
    res.redirect("/listings");
};

module.exports.logOut = (req, res) => {
    //this is also a passport method
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "Logout successfully");
        res.redirect("/listings");
    });
};