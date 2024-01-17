const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
// const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingControllers = require("../controllers/listings.js")
const multer = require("multer"); //to parse file data to backend
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage })

router
  .route("/")
  .get(listingControllers.index)
  .post(isLoggedIn, upload.single("listing[image]"),//to parse file data to abckend
   listingControllers.createNewListing);

router.get("/new", isLoggedIn, listingControllers.renderNewForm);
  
router
  .route("/:id")   
  .get(listingControllers.showListing)
  .put( isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, listingControllers.updateListing)
  .delete( isLoggedIn, isOwner, listingControllers.deleteListing);

router.get("/:id/edit", isLoggedIn, isOwner, listingControllers.renderEditListing);

module.exports = router;