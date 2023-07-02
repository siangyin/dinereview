const pool = require("../database/connectSql");

const addRestaurant = async (req, res) => {
	try {
		const { restaurant, photos } = req.body;
		const msg = [];
		if (Object.entries(restaurant).length) {
			// insert restaurant table
			let sqlVal = [];
			let sql = "";

			for (const prop in restaurant) {
				sql += `, ${prop} = ?`;
				sqlVal.push(restaurant[prop]);
			}

			sql = `insert restaurants set ${sql.replace(",", "")}`;
			let [row] = await pool.query(sql, sqlVal);
			if (!row.insertId) {
				msg.push("restaurant table insertion failed");
			} else {
				// Restaurant added successfully
				// get restaurantId
				restaurant.restaurantId = row.insertId;

				if (photos) {
					// insert Photos
					// E.G. INSERT INTO Photos (restaurantId, photoUrl, defaultPhoto, createdOn, addedBy)

					for (const item of photos) {
						sql = `insert into Photos (restaurantId, photoUrl, defaultPhoto) values (?, ? ,?)`;
						sqlVal = [
							restaurant.restaurantId,
							item.photoUrl,
							item.defaultPhoto ?? false,
						];
						[row] = await pool.query(sql, sqlVal);

						!row.insertId &&
							msg.push(`restaurant photo ${item.photoUrl} insertion failed`);
					}
				}
			}

			// change restaurant status from draft to active
			sql = "update restaurants set status = ? where restaurantId = ?";
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
			msg: error,
		});
	}
};

const updateRestaurant = async (req, res) => {
	try {
		const { id } = req.params;
		const { restaurant, photos } = req.body;
		const msg = [];
		if (Object.entries(restaurant).length) {
			let sqlVal = [];
			let sql = "";

			for (const prop in restaurant) {
				sql += `, ${prop} = ?`;
				sqlVal.push(restaurant[prop]);
			}

			sql = `update restaurants set ${sql.replace(
				",",
				""
			)} where restaurantId = ?`;

			let [row] = await pool.query(sql, [...sqlVal, id]);

			if (!row.affectedRows) {
				msg.push("restaurant table update failed");
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

					// to update Photos, remove existing and replace current photos
					// E.G. insert into Photos (restaurantId, photoUrl, defaultPhoto, createdOn, addedBy)
					sql = `delete from photos where restaurantId =? and reviewId IS NULL and addedBy IS NULL and photoId NOT IN (${existingId.toString()})`;
					[row] = await pool.query(sql, [id]);

					if (Boolean(updatePhoto.length)) {
						// update photo
						for (const item of updatePhoto) {
							sql = `update Photos set photoUrl = ?, defaultPhoto = ? where photoId = ?`;
							sqlVal = [
								item.photoUrl,
								item.defaultPhoto ?? false,
								item.photoId,
							];
							[row] = await pool.query(sql, sqlVal);
							!row.affectedRows &&
								msg.push(`photoId ${item.photoId} update failed`);
						}
					}

					if (Boolean(insertPhoto.length)) {
						// insert photo
						for (const item of insertPhoto) {
							sql = `insert into Photos (restaurantId, photoUrl, defaultPhoto) values (?, ? ,?)`;
							sqlVal = [id, item.photoUrl, item.defaultPhoto ?? false];
							[row] = await pool.query(sql, sqlVal);
							!row.insertId &&
								msg.push(`photo ${item.photoUrl} insertion failed`);
						}
					}
				}
			}

			// get updated restaurant and photo
			sql = "select * from restaurants where restaurantId = ?";
			[row] = await pool.query(sql, [id]);
			const updatedRestaurant = row[0];

			sql =
				"select * from photos where restaurantId =? and reviewId IS NULL and addedBy IS NULL";
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
			msg: error,
		});
	}
};

const getRestaurantDetail = async (req, res) => {
	try {
		const { id } = req.params;
		const data = {};
		let sql = `select * from Restaurants where restaurantId = ?`;
		let [row] = await pool.query(sql, [id]);

		if (row[0]) {
			data["restaurant"] = row[0];

			sql = `select * from Photos where restaurantId = ?`;
			[row] = await pool.query(sql, [id]);
			// get admin uploaded photos
			data["photos"] = row;

			// get all reviews of query restaurant
			sql = `select * from Reviews where restaurantId = ?`;
			[row] = await pool.query(sql, [id]);
			data.avgRating = null;
			data.totalReviews = 0;
			data.reviews = [];

			// if found related review of query restaurant
			if (Boolean(row.length)) {
				const [count] = await pool.query(
					`select AVG(rating) as avg, count(*) as counts FROM Reviews WHERE restaurantId = ${id}`
				);
				data.totalReviews = Number.parseInt(count[0].counts);
				data.avgRating = +parseFloat(count[0].avg).toFixed(1) ?? null;

				// Loop thru each Reviews row
				for (let item of row) {
					// find review's user detail
					sql = `select * from Users where userId =${item.userId}`;
					const [user] = await pool.query(sql);

					if (Boolean(user[0])) {
						item.username = user[0].username;
						item.profilePhoto = user[0].profilePhoto;
					}

					// find review's relevant photos
					sql = `select photoId, photoUrl from Photos where reviewId = ${item.reviewId}`;
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
			msg: error,
		});
	}
};

const getRestaurantsList = async (req, res) => {
	try {
		const data = [];
		let sql = `select * from Restaurants where status = ?`;
		let [row] = await pool.query(sql, ["active"]);

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
					`select * from Photos where restaurantId = ? and defaultPhoto =?`,
					[i.restaurantId, true]
				);

				db.photos = row2[0].photoUrl ?? null;

				const [count] = await pool.query(
					`select AVG(rating) as avg, count(*) as counts from Reviews where restaurantId = ${i.restaurantId}`
				);

				db.totalReviews = Number.parseInt(count[0].counts);
				db.avgRating = +parseFloat(count[0].avg).toFixed(1) ?? null;

				data.push(db);
			}

			return res.status(200).json({
				status: "OK",
				count: data.length,
				data: data,
			});
		}

		res.status(404).json({
			status: "Not found",
			msg: `No data found`,
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error,
		});
	}
};

const saveFavourite = async (req, res) => {
	try {
		const { userId, restaurantId } = req.body;

		if (userId && restaurantId) {
			// check if user has saved the restaurant
			let sql = `select * from SavedRestaurants where restaurantId = ? and userId = ?`;
			let [row] = await pool.query(sql, [restaurantId, userId]);

			// if not saved, save the user fav restaurant
			if (!Boolean(row.length)) {
				sql = `insert into SavedRestaurants (restaurantId, userId) values (? ,?)`;
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
			msg: error,
		});
	}
};

const getFavourite = async (req, res) => {
	try {
		const { userId, restaurantId } = req.query;

		if (userId && restaurantId) {
			// check if user has saved the restaurant
			let sql = `select * from SavedRestaurants where restaurantId = ? and userId = ?`;
			let [row] = await pool.query(sql, [restaurantId, userId]);

			return res.status(200).json({
				status: "OK",
				isSaved: Boolean(row.length) ? true : false,
			});
		} else if (userId) {
			// get user fav list with restaurant detail
			let sql = `select * from SavedRestaurants LEFT JOIN Restaurants ON SavedRestaurants.restaurantId=Restaurants.restaurantId  where SavedRestaurants.userId= ${userId}`;
			let [row] = await pool.query(sql);

			return res.status(200).json({
				status: "OK",
				data: row,
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
			msg: error,
		});
	}
};

const removeFavourite = async (req, res) => {
	try {
		const { userId, restaurantId } = req.query;

		if (userId && restaurantId) {
			// check if user has saved the restaurant
			let sql = `select * from SavedRestaurants where restaurantId = ? and userId = ?`;
			let [row] = await pool.query(sql, [restaurantId, userId]);

			// if not saved, save the user fav restaurant
			if (Boolean(row.length)) {
				sql = `delete from SavedRestaurants where restaurantId = ? and userId = ?`;
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
			msg: error,
		});
	}
};

module.exports = {
	addRestaurant,
	updateRestaurant,
	getRestaurantDetail,
	getRestaurantsList,
	saveFavourite,
	getFavourite,
	removeFavourite,
};
