const pool = require("../database/connectSql");

const addReview = async (req, res) => {
	try {
		const { review, photos } = req.body;
		const msg = [];
		let sql = "";
		let sqlVal = [];
		if (
			review &&
			review.restaurantId &&
			review.userId &&
			review.content &&
			review.rating
		) {
			const { restaurantId, userId, content, rating } = review;
			sql = `insert into Reviews (restaurantId, userId, title, content, rating) values(?,?,?,?,?)`;
			sqlVal = [restaurantId, userId, review.title ?? null, content, rating];
			let [row] = await pool.query(sql, sqlVal);
			console.log(row);
			if (Boolean(row.insertId)) {
				review.reviewId = row.insertId;

				if (Boolean(photos.length)) {
					// if has photos, insert photos
					for (const item of photos) {
						sql = `insert into Photos (restaurantId, reviewId, photoUrl, defaultPhoto, addedBy) values (?, ? ,?, ? ,?)`;
						sqlVal = [
							restaurantId,
							review.reviewId,
							item.photoUrl,
							false,
							userId,
						];
						[row] = await pool.query(sql, sqlVal);
						console.log(row);
						!row.insertId &&
							msg.push(`photo ${item.photoUrl} insertion failed`);
					}
				}

				// update review status from draft to active
				sql = `update Reviews set status = ? where reviewId =?`;
				sqlVal = ["active", review.reviewId];
				[row] = await pool.query(sql, sqlVal);
				console.log(row);
				if (row.affectedRows) {
					return res.status(200).json({
						status: "OK",
						msg: `Review has been added successfully, reviewId ${review.reviewId}`,
					});
				}
			} else {
				msg.push(`Review insertion failed`);
			}
		} else {
			msg.push("Missing detail: restaurantId, userId, content, rating");
			return res.status(400).json({
				status: "Invalid request",
				msg: msg,
			});
		}

		return res.status(400).json({
			status: "Invalid request",
			msg: "Invalid request",
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error,
		});
	}
};
// GET A REVIEW by reviewId
const getReview = async (req, res) => {
	try {
		res.status(400).json({
			status: "Invalid request",
			msg: "Invalid request",
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error,
		});
	}
};

// GET ALL REVIEWS by query restaurantId or userId
const getAllReviews = async (req, res) => {
	try {
		return res.status(200).json({
			status: "Invalid request",
			msg: "Invalid request",
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error,
		});
	}
};

// UPDATE A REVIEW by reviewId (user ownself, or admin)
const updateReview = async (req, res) => {
	try {
		res.status(200).json({
			status: "OK",
			data: data,
		});

		res.status(404).json({
			status: "Not found",
			msg: "No data found",
		});
	} catch (error) {
		res.status(500).json({
			status: "Server error",
			msg: error,
		});
	}
};

// DELETE A REVIEW by reviewId (user ownself, or admin)
const deleteReview = async (req, res) => {
	try {
		res.status(200).json({
			status: "OK",
			data: data,
		});

		res.status(404).json({
			status: "Not found",
			msg: "No data found",
		});
	} catch (error) {
		res.status(500).json({
			status: "Server error",
			msg: error,
		});
	}
};

module.exports = {
	addReview,
	getReview,
	getAllReviews,
	updateReview,
	deleteReview,
};
