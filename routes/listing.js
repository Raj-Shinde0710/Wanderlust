const express = require("express")
const router = express.Router()
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js")
const Listing = require("../models/listing")
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js")
const {storage} = require("../cloudConfig.js")
const listingController = require("../controllers/listings.js")
const multer = require("multer")
const upload = multer({ storage })



//index and create route
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync( listingController.createListing))

  //new route
  router.get("/new", isLoggedIn, listingController.renderNewForm)

router.route("/:id")
.get( wrapAsync(listingController.showListing))
.delete( isLoggedIn, isOwner,wrapAsync(listingController.destroyListing))
.put(isLoggedIn, isOwner, upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing))









//edit route
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm))


module.exports = router