const pool = require("../database/connectSql");

const addRestaurant = async (req, res) => {
	try {
		const { restaurant, photos } = req.body;
		const msg = [];
		if (Object.keys(restaurant).length !== 0) {
			// insert restaurant table
			let sqlVal = [];
			let sql = "";

			for (const prop in restaurant) {
				sql += `, ${prop} = ?`;
				sqlVal.push(restaurant[prop]);
			}

			sql = `INSERT INTO restaurants SET ${sql.replace(",", "")}`;
			let [row] = await pool.query(sql, sqlVal);
			if (!row.insertId) {
				msg.push("Restaurant table insertion failed");
			} else {
				// Restaurant added successfully
				// get restaurantId
				restaurant.restaurantId = row.insertId;

				if (photos) {
					// insert Photos
					// E.G. INSERT INTO Photos (restaurantId, photoUrl, defaultPhoto, createdOn, addedBy)

					for (const item of photos) {
						sql = `INSERT INTO photos (restaurantId, photoUrl, defaultPhoto) VALUES (?, ?, ?)`;
						sqlVal = [
							restaurant.restaurantId,
							item.photoUrl,
							item.defaultPhoto ?? false,
						];
						[row] = await pool.query(sql, sqlVal);

						!row.insertId &&
							msg.push(`Restaurant photo ${item.photoUrl} insertion failed`);
					}
				}
			}

			// change restaurant status from draft to active
			sql = "UPDATE restaurants SET status = ? WHERE restaurantId = ?";
			[row] = await pool.query(sql, ["active", restaurant.restaurantId]);

			return res.status(200).json({
				status: "OK",
				msg: "Restaurant has been added successfully",
				data: restaurant,
				hasError: msg,
			});
		}
		res.status(400).json({
			status: "Invalid request",
			msg: "Missing detail",
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error.message,
		});
	}
};

const updateRestaurant = async (req, res) => {
	try {
		const { id } = req.params;
		const { restaurant, photos } = req.body;
		const msg = [];
		if (Object.keys(restaurant).length !== 0) {
			let sqlVal = [];
			let sql = "";

			for (const prop in restaurant) {
				sql += `, ${prop} = ?`;
				sqlVal.push(restaurant[prop]);
			}

			sql = `UPDATE restaurants SET ${sql.replace(
				",",
				""
			)} WHERE restaurantId = ?`;

			let [row] = await pool.query(sql, [...sqlVal, id]);

			if (!row.affectedRows) {
				msg.push("Restaurant table update failed");
			} else {
				// Restaurant updated successfully
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

					// to update Photos, remove existing AND replace current photos
					// E.G. INSERT INTO Photos (restaurantId, photoUrl, defaultPhoto, createdOn, addedBy)
					sql = `DELETE FROM photos WHERE restaurantId = ? AND reviewId IS NULL AND addedBy IS NULL AND photoId NOT IN (${existingId.toString()})`;
					[row] = await pool.query(sql, [id]);

					if (Boolean(updatePhoto.length)) {
						// update photo
						for (const item of updatePhoto) {
							sql = `UPDATE photos SET photoUrl = ?, defaultPhoto = ? WHERE photoId = ?`;
							sqlVal = [
								item.photoUrl,
								item.defaultPhoto ?? false,
								item.photoId,
							];
							[row] = await pool.query(sql, sqlVal);
							!row.affectedRows &&
								msg.push(`PhotoId ${item.photoId} update failed`);
						}
					}

					if (Boolean(insertPhoto.length)) {
						// insert photo
						for (const item of insertPhoto) {
							sql = `INSERT INTO photos (restaurantId, photoUrl, defaultPhoto) VALUES (?, ?, ?)`;
							sqlVal = [id, item.photoUrl, item.defaultPhoto ?? false];
							[row] = await pool.query(sql, sqlVal);
							!row.insertId &&
								msg.push(`Photo ${item.photoUrl} insertion failed`);
						}
					}
				}
			}

			// get updated restaurant AND photo
			sql = "SELECT * FROM restaurants WHERE restaurantId = ?";
			[row] = await pool.query(sql, [id]);
			const updatedRestaurant = row[0];

			sql =
				"SELECT * FROM photos WHERE restaurantId = ? AND reviewId IS NULL AND addedBy IS NULL";
			[row] = await pool.query(sql, [id]);
			updatedRestaurant["photos"] = [...row];

			return res.status(200).json({
				status: "OK",
				msg: "Restaurant has been added successfully",
				data: updatedRestaurant,
				hasError: msg,
			});
		}
		res.status(400).json({
			status: "Invalid request",
			msg: "Missing detail",
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error.message,
		});
	}
};

const getRestaurantDetail = async (req, res) => {
	try {
		const { id } = req.params;
		const data = {};
		let sql = `SELECT * FROM restaurants WHERE restaurantId = ? AND status=?`;
		let [row] = await pool.query(sql, [id, "active"]);

		if (row[0]) {
			data["restaurant"] = row[0];

			sql = `SELECT * FROM photos WHERE restaurantId = ? AND status=?`;
			[row] = await pool.query(sql, [id, "active"]);
			// get admin uploaded photos
			data.photos = row;

			// get all reviews of query restaurant
			sql = `SELECT * FROM reviews WHERE restaurantId = ? AND status=?`;
			[row] = await pool.query(sql, [id, "active"]);
			data.avgRating = null;
			data.totalReviews = 0;
			data.reviews = [];

			// if found related review of query restaurant
			if (Boolean(row.length)) {
				const [count] = await pool.query(
					`SELECT AVG(rating) AS avg, COUNT(*) AS counts FROM reviews WHERE restaurantId = ${id}`
				);
				data.totalReviews = Number.parseInt(count[0].counts);
				data.avgRating = +parseFloat(count[0].avg).toFixed(1) ?? null;

				// Loop thru each Reviews row
				for (let item of row) {
					// find review's user detail
					sql = `SELECT * FROM users WHERE userId = ${item.userId}`;
					const [user] = await pool.query(sql);

					if (Boolean(user[0])) {
						item.username = user[0].username;
						item.profilePhoto = user[0].profilePhoto;
					}

					// find review's relevant photos
					sql = `SELECT photoId, photoUrl FROM photos WHERE reviewId = ${item.reviewId}`;
					const [row2] = await pool.query(sql);

					if (Boolean(row2)) {
						data.reviews.push({ ...item, photos: row2 });
					} else {
						data.reviews.push({ ...item, photos: [] });
					}
				}
			}

			return res.status(200).json({
				status: "OK",
				data: data,
			});
		}

		res.status(404).json({
			status: "Not found",
			msg: `No data found with restaurantId ${id} found`,
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error.message,
		});
	}
};

const getRestaurantsList = async (req, res) => {
	try {
		const data = [];
		let sql = `SELECT * FROM Restaurants`;
		let [row] = await pool.query(sql);

		if (Boolean(row)) {
			for (const i of row) {
				const db = {
					restaurantId: i.restaurantId,
					name: i.name,
					area: i.area,
					totalReviews: 0,
					avgRating: null,
					type: i.type.split(",").map((str) => str.trim()),
					cuisine: i.cuisine.split(",").map((str) => str.trim()),
					photos: null,
					status: i.status,
				};

				//  get Restaurant Primary Photo
				const [row2] = await pool.query(
					`SELECT * FROM Photos WHERE restaurantId = ? AND defaultPhoto = ? AND status=?`,
					[i.restaurantId, true, "active"]
				);

				db.photos = row2[0].photoUrl ?? null;

				const [count] = await pool.query(
					`SELECT AVG(rating) AS avg, COUNT(*) AS counts FROM Reviews WHERE restaurantId = ? AND status=?`,
					[i.restaurantId, "active"]
				);

				db.totalReviews = Number.parseInt(count[0].counts);
				db.avgRating = +parseFloat(count[0].avg).toFixed(1) ?? null;

				data.push(db);
			}

			return res.status(200).json({
				status: "OK",
				count: data.length,
				data: data.sort((p1, p2) =>
					p1.name > p2.name ? 1 : p1.name < p2.name ? -1 : 0
				),
			});
		}

		res.status(404).json({
			status: "Not found",
			msg: `No data found`,
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error.message,
		});
	}
};

const deleteRestaurant = async (req, res) => {
	try {
		const { id } = req.params;
		const success = [];
		const failed = [];
		let msg;
		let sql = `DELETE FROM SavedRestaurants WHERE restaurantId = ?`;
		let [row] = await pool.query(sql, [id]);

		row ? success.push("Favourite") : failed.push("Favourite");

		sql = `DELETE FROM Photos WHERE restaurantId = ?`;
		[row] = await pool.query(sql, [id]);

		row ? success.push("Photos") : failed.push("Photos");

		sql = `DELETE FROM Reviews WHERE restaurantId = ?`;
		[row] = await pool.query(sql, [id]);

		row ? success.push("Reviews") : failed.push("Reviews");

		sql = `DELETE FROM Restaurants WHERE restaurantId = ?`;
		[row] = await pool.query(sql, [id]);

		if (row) {
			msg = `Deleted Restaurant with details ${success.toString()}`;
			if (failed.length > 0) {
				msg += "except" + failed.toString();
			}

			return res.status(200).json({
				status: "OK",
				msg: msg,
			});
		} else {
			msg = `Unable to delete Restaurant with details ${
				failed.length && "except" + failed.toString()
			}${success.length && ", has deleted data in " + success.toString()} `;

			return res.status(400).json({
				status: "Request failed",
				msg: msg,
			});
		}
	} catch (error) {
		res.status(500).json({
			status: "Server error",
			msg: error.message,
		});
	}
};

const saveFavourite = async (req, res) => {
	try {
		const { userId, restaurantId } = req.body;

		if (userId && restaurantId) {
			// check if user has saved the restaurant
			let sql = `SELECT * from SavedRestaurants WHERE restaurantId = ? AND userId = ?`;
			let [row] = await pool.query(sql, [restaurantId, userId]);

			// if not saved, save the user fav restaurant
			if (!Boolean(row.length)) {
				sql = `INSERT INTO SavedRestaurants (restaurantId, userId) VALUES (? ,?)`;
				[row] = await pool.query(sql, [restaurantId, userId]);

				if (row.affectedRows) {
					return res.status(200).json({
						status: "OK",
						msg: "Restaurant has added to favourite list",
					});
				}
			}
			return res.status(400).json({
				status: "Invalid request",
				msg: "Restaurant exist in fav list",
			});
		}

		res.status(400).json({
			status: "Invalid request",
			msg: "Missing detail",
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error.message,
		});
	}
};

const getFavourite = async (req, res) => {
	try {
		const { userId, restaurantId } = req.query;

		if (userId && restaurantId) {
			// check if user has saved the restaurant
			let sql = `SELECT * FROM SavedRestaurants WHERE restaurantId = ? AND userId = ?`;
			let [row] = await pool.query(sql, [restaurantId, userId]);

			return res.status(200).json({
				status: "OK",
				isSaved: Boolean(row.length) ? true : false,
			});
		} else if (userId) {
			// get user fav list with restaurant detail
			let sql = `SELECT SavedRestaurants.restaurantId, Restaurants.name, Restaurants.type, Restaurants.cuisine, SavedRestaurants.addedOn 
			from SavedRestaurants LEFT JOIN Restaurants ON SavedRestaurants.restaurantId = Restaurants.restaurantId  WHERE SavedRestaurants.userId= ${userId}`;
			let [row] = await pool.query(sql);
			const data = [];
			if (Boolean(row.length)) {
				for (let item of row) {
					const restaurant = { ...item };
					sql = `SELECT AVG(rating) as avg, count(*) as counts FROM Reviews WHERE restaurantId = ${item.restaurantId}`;
					const [review] = await pool.query(sql);
					restaurant.totalReviews = Number.parseInt(review[0].counts);
					restaurant.avgRating = +parseFloat(review[0].avg).toFixed(1) ?? null;
					data.push(restaurant);
				}
			}

			return res.status(200).json({
				status: "OK",
				data: data,
			});
		} else {
			res.status(400).json({
				status: "Invalid request",
				msg: "Missing detail",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error.message,
		});
	}
};

const removeFavourite = async (req, res) => {
	try {
		const { userId, restaurantId } = req.query;

		if (userId && restaurantId) {
			// check if user has saved the restaurant
			let sql = `SELECT * from SavedRestaurants WHERE restaurantId = ? AND userId = ?`;
			let [row] = await pool.query(sql, [restaurantId, userId]);

			// if not saved, save the user fav restaurant
			if (Boolean(row.length)) {
				sql = `DELETE FROM SavedRestaurants WHERE restaurantId = ? AND userId = ?`;
				[row] = await pool.query(sql, [restaurantId, userId]);

				if (row) {
					return res.status(200).json({
						status: "OK",
						msg: "Restaurant has removed from favourite list",
					});
				}
			}
			return res.status(400).json({
				status: "Invalid request",
				msg: "Record not found",
			});
		}

		res.status(400).json({
			status: "Invalid request",
			msg: "Missing detail/ record not found",
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error.message,
		});
	}
};

module.exports = {
	addRestaurant,
	updateRestaurant,
	getRestaurantDetail,
	getRestaurantsList,
	deleteRestaurant,
	saveFavourite,
	getFavourite,
	removeFavourite,
};
