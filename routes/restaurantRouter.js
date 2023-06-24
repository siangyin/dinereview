const express = require("express");
const router = express.Router();

const {
	addRestaurant,
	updateRestaurant,
	getRestaurantDetail,
	getRestaurantsList,
} = require("../controllers/restaurantController");

router.route("/").get(getRestaurantsList).post(addRestaurant);
router.route("/:id").get(getRestaurantDetail).patch(updateRestaurant);

module.exports = router;
