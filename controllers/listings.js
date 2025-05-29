const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm =  (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path:"author"}}).populate("owner");
    if(!listing){
      req.flash("error", "listing not found or deleted");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createNewListing = async (req, res, next) => {
    try{
      let responce = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send(); 

      let url = req.file.path;
      let filename = req.file.filename;
      const newListing = new Listing(req.body.listing);
      newListing.owner = req.user._id; //to save user info who created listing
      newListing.image = {url, filename};

      newListing.geometry = responce.body.features[0].geometry;

      let savedListing = await newListing.save();
      console.log(savedListing);
      req.flash("success", "New listing Created!");
      res.redirect("/listings");
    }catch(err){
      next(err);
    }
};

module.exports.renderEditListing =  async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error", "listing not found or deleted");
      res.render("/listing");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_200");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !== "undefined"){
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = {url, filename};
      await listing.save();
    }
    req.flash("success", "listing Edited success");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "listing deleted success");
    res.redirect("/listings");
};