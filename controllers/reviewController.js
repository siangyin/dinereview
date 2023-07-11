const pool = require("../database/connectSql");

const addReview = async (req, res) => {
	try {
		const { restaurantId, content, rating, photos, userId, title } = req.body;
		let reviewId;
		const msg = [];
		let sql = "";
		let sqlVal = [];
		if (restaurantId && content && rating) {
			sql = `insert into Reviews (restaurantId, userId, title, content, rating) values(?,?,?,?,?)`;
			sqlVal = [restaurantId, userId, title ?? null, content, rating];
			let [row] = await pool.query(sql, sqlVal);

			if (Boolean(row.insertId)) {
				reviewId = row.insertId;

				if (Boolean(photos.length)) {
					// if has photos, insert photos
					for (const item of photos) {
						sql = `insert into Photos (restaurantId, reviewId, photoUrl, defaultPhoto, addedBy) values (?, ? ,?, ? ,?)`;
						sqlVal = [restaurantId, reviewId, item.photoUrl, false, userId];
						[row] = await pool.query(sql, sqlVal);

						!row.insertId &&
							msg.push(`photo ${item.photoUrl} insertion failed`);
					}
				}

				// update review status from draft to active
				sql = `update Reviews set status = ? where reviewId =?`;
				sqlVal = ["active", reviewId];
				[row] = await pool.query(sql, sqlVal);

				if (row.affectedRows) {
					return res.status(200).json({
						status: "OK",
						msg: `Review has been added successfully`,
						reviewId: reviewId,
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
const getReviews = async (req, res) => {
	try {
		const { userId, restaurantId, reviewId } = req.query;
		let data;
		let sql = `select reviews.reviewId, reviews.restaurantId, restaurants.name,reviews.userId, reviews.title, reviews.content, reviews.rating, reviews.createdOn from reviews left join restaurants on reviews.restaurantId = restaurants.restaurantId`;
		if (userId && restaurantId) {
			sql = sql + ` where reviews.restaurantId = ? and reviews.userId = ?`;
			const [row] = await pool.query(sql, [restaurantId, userId]);

			if (Boolean(row)) {
				data = row;
			}
		} else if (userId) {
			sql = sql + ` where reviews.userId = ?`;
			const [row] = await pool.query(sql, [userId]);

			if (Boolean(row)) {
				data = row;
			}
		} else if (restaurantId) {
			sql = sql + ` where reviews.restaurantId = ?`;
			const [row] = await pool.query(sql, [restaurantId]);

			if (Boolean(row)) {
				data = row;
			}
		} else if (reviewId) {
			const sql = `select reviews.reviewId, reviews.restaurantId, restaurants.name,reviews.userId, reviews.title, reviews.content, reviews.rating, reviews.createdOn from reviews left join restaurants on reviews.restaurantId = restaurants.restaurantId where reviews.reviewId =? `;
			const [row] = await pool.query(sql, [reviewId]);

			if (Boolean(row)) {
				data = row;
			}
		}

		// if has result find all photos
		if (Boolean(data.length)) {
			for (const db of data) {
				const sql = `select * from Photos where reviewId = ?`;
				const [row] = await pool.query(sql, db.reviewId);
				db.photos = row;
			}

			return res.status(200).json({
				status: "OK",
				data: data,
			});
		} else
			return res.status(200).json({
				status: "OK",
				msg: "No data found",
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
		const { userId, restaurantId, reviewId } = req.body;
		let msg = [];
		// update review content
		if (userId && restaurantId && reviewId) {
			const { title, content, rating, photos } = req.body;
			let sql = `update Reviews set title = ?, content = ?, rating = ? where reviewId = ?`;
			let sqlVal = [title, content, rating, reviewId];
			let [row] = await pool.query(sql, sqlVal);
			msg.push(row.affectedRows ? "review updated" : "review update failed");

			if (Boolean(photos.length)) {
				const existingId = [];
				const insertPhoto = [];
				const updatePhoto = [];
				photos.forEach((item) => {
					if (item.photoId) {
						existingId.push(item.photoId);
						updatePhoto.push(item);
					} else {
						insertPhoto.push(item);
					}
				});

				// to update Photos, remove existing and replace current photos
				sql = `delete from photos where reviewId = ${reviewId} and addedBy = ${userId} and photoId NOT IN (${existingId.toString()})`;
				[row] = await pool.query(sql);

				if (Boolean(updatePhoto.length)) {
					// update photo
					for (const item of updatePhoto) {
						sql = `update Photos set photoUrl = ?, restaurantId = ? where photoId = ?`;
						sqlVal = [item.photoUrl, restaurantId, item.photoId];
						[row] = await pool.query(sql, sqlVal);
						!row.affectedRows &&
							msg.push(`photoId ${item.photoId} update failed`);
					}
				}

				if (Boolean(insertPhoto.length)) {
					// insert photo
					for (const item of insertPhoto) {
						sql = `insert into Photos (restaurantId, photoUrl, reviewId, addedBy) values (?, ? ,?, ?)`;
						sqlVal = [restaurantId, item.photoUrl, reviewId, userId];
						[row] = await pool.query(sql, sqlVal);
						!row.insertId &&
							msg.push(`photo ${item.photoUrl} insertion failed`);
					}
				}
			}
			return res.status(200).json({
				status: "OK",
				msg: msg,
				reviewId: reviewId,
			});
		}
		res.status(400).json({
			status: "Invalid request",
			msg: "Invalid request",
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
		const { id } = req.params;
		let sql = `delete from photos where reviewId = ?`;
		let [row] = await pool.query(sql, [id]);
		let msg;
		if (row.affectedRows) {
			msg = "Photo";
		}

		sql = `delete from reviews where reviewId = ?`;
		[row] = await pool.query(sql, [id]);
		if (row.affectedRows) {
			msg = `Review ${msg && "&" + msg} deleted`;
		}

		res.status(200).json({
			status: "OK",
			msg: "Review deleted",
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
	getReviews,
	updateReview,
	deleteReview,
};
