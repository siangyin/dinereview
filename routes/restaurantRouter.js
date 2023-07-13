const express = require("express");
const router = express.Router();

const {
	addRestaurant,
	updateRestaurant,
	getRestaurantDetail,
	getRestaurantsList,
	deleteRestaurant,
	saveFavourite,
	getFavourite,
	removeFavourite,
} = require("../controllers/restaurantController");

router
	.route("/fav")
	.get(getFavourite)
	.post(saveFavourite)
	.delete(removeFavourite);
router.route("/").post(addRestaurant).get(getRestaurantsList);
router
	.route("/:id")
	.get(getRestaurantDetail)
	.patch(updateRestaurant)
	.delete(deleteRestaurant);

module.exports = router;
