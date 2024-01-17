const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
    // console.log(req.path, ".." , req.originalUrl);
    if(!req.isAuthenticated()){
        //redirectUrl save
        // req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must logged in before make change!");
        return res.redirect("/login");
    };
    next();
}

//redirectUrl save in locals
// module.exports.saveRedirectUrl = (req, res, next) => {
//     if(req.session.redirectUrl){
//       req.locals.redirectUrl = req.session.redirectUrl;
//     };
//     next();
// };

module.exports.isOwner = async(req, res, next) => {
  try{  
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You don't have permission to make change");
        return res.redirect(`/listings/${id}`)
    }
    next();
  }catch(err){
    next(err);
  }
};

// Serverside Validation Schema
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if(error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else{
      next();
    };
  };


  module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else{
      next();
    };
  };

  module.exports.isReviewAuthor = async(req, res, next) => {
    try{  
      let { id, reviewId } = req.params;
      let review = await Review.findById(reviewId);
      if(!review.author._id.equals(res.locals.currUser._id)){
          req.flash("error", "You don't have permission to make change");
          return res.redirect(`/listings/${id}`)
      }
      next();
    }catch(err){
      next(err);
    }
  };

