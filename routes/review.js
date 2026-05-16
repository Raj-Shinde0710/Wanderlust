const express = require("express")
const router = express.Router({mergeParams : true})
const wrapAsync = require("../utils/wrapAsync.js")

const Listing = require("../models/listing")
const Review = require("../models/review.js")
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")


const reviewController = require("../controllers/reviews.js")

//post route 
router.post("/", validateReview, isLoggedIn, wrapAsync( reviewController.createReview))

router.delete("/:reviewId" ,isLoggedIn,isReviewAuthor, wrapAsync( reviewController.destroyReview))


module.exports = router