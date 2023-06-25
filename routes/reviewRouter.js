const express = require("express");
const router = express.Router();

const {
	addReview,
	getReview,
	getAllReviews,
	updateReview,
	deleteReview,
} = require("../controllers/reviewController");

router.route("/").get(getAllReviews).post(addReview);
router.route("/:id").get(getReview).patch(updateReview).delete(deleteReview);

module.exports = router;
