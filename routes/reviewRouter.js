const express = require("express");
const router = express.Router();

const {
	addReview,
	getReviews,
	updateReview,
	deleteReview,
} = require("../controllers/reviewController");

router.route("/").get(getReviews).post(addReview).patch(updateReview);
router.route("/:id").delete(deleteReview);

module.exports = router;
