const express = require("express");
const router = express.Router({mergeParams: true});
const Listing = require("../models/listing.js");
//const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");
  
//post route
router.post("/", isLoggedIn, validateReview, reviewController.createReview);
  
//delete route
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, reviewController.destroyReview);
  
module.exports = router;  