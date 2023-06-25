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
			data["photos"] = row;

			sql = `select * from Reviews where restaurantId = ?`;
			[row] = await pool.query(sql, [id]);
			data["reviews"] = row;

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
};
