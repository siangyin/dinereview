const express = require("express");
const router = express.Router();

const {
	getUserProfile,
	updateUserProfile,
	getUserList,
} = require("../controllers/userController");

router.route("/").get(getUserList);
router.route("/:id").get(getUserProfile).patch(updateUserProfile);

module.exports = router;
