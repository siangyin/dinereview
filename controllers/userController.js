const pool = require("../database/connectSql");

const getUserProfile = async (req, res) => {
	try {
		const { id } = req.params;

		let sql = `SELECT * from users WHERE userId =?`;
		let [user] = await pool.query(sql, [id]);
		if (user[0]) {
			return res.status(200).json({
				status: "OK",
				data: user[0],
			});
		}
		res.status(200).json({
			status: "No data",
			msg: "no data found",
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error.message,
		});
	}
};

const updateUserProfile = async (req, res) => {
	try {
		const { id } = req.params;
		const userUpdate = req.body;
		if (Object.entries(userUpdate).length) {
			let sqlVal = [];
			let sql = "";

			for (const prop in userUpdate) {
				sql += `, ${prop} = ?`;
				sqlVal.push(userUpdate[prop]);
			}

			sql = `update users set ${sql.replace(",", "")} WHERE userId = ?`;

			let [user] = await pool.query(sql, [...sqlVal, id]);

			if (user.affectedRows) {
				return res.status(200).json({
					status: "OK",
					msg: "User updated",
				});
			} else {
				return res.status(400).json({
					status: "Request failed",
					msg: "Update failed",
				});
			}
		}

		res.status(200).json({
			status: "No data",
			msg: "no data found",
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error.message,
		});
	}
};

const getUserList = async (req, res) => {
	try {
		let sql = `SELECT * from users`;
		let [users] = await pool.query(sql);

		if (users) {
			return res.status(200).json({
				status: "OK",
				data: users.map((user) => {
					return { ...user, password: undefined };
				}),
			});
		}
		res.status(200).json({
			status: "No data",
			msg: "no data found",
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error.message,
		});
	}
};

module.exports = {
	getUserProfile,
	updateUserProfile,
	getUserList,
};
