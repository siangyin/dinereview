const pool = require("../database/connectSql");
const jwt = require("jsonwebtoken");

const createJWT = (payload) =>
	(token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: "30d",
	}));

const register = async (req, res) => {
	try {
		const { email, password, username } = req.body;

		// find users with same email
		const [users] = await pool.query("select * from users where email = ?", [
			email,
		]);

		if (users.length) {
			return res
				.status(400)
				.json({ status: "Bad request", msg: "Email already exists" });
		} else {
			const sql =
				"insert into users (email, password, username) values (?, ?, ?)";
			const [user] = await pool.query(sql, [email, password, username]);
			// rows.insertedId is the created item id
			// new user registration success
			if (user.insertId) {
				const token = createJWT({
					userId: user.insertId,
					email,
					username,
					role: "user",
				});
				return res.status(201).json({
					status: "OK",
					msg: "user created successfully",
					token,
				});
			} else {
				// new user registration failed
				return res.status(406).json({
					status: "Request failed",
					msg: "Request failed",
				});
			}
		}
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error,
		});
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const [users] = await pool.query(
			"select * from users where email = ? and password = ?",
			[email, password]
		);

		// found user with correct email & password
		if (users[0]) {
			const user = {
				userId: users[0].userId,
				email: users[0].email,
				username: users[0].username,
				role: users[0].role,
			};

			return res.status(200).json({
				status: "OK",
				msg: "User login successfully",
				data: user,
				token: createJWT(user),
			});
		}

		res.status(401).json({
			status: "Invalid credentials",
			msg: "Invalid credentials, please try again",
		});
	} catch (error) {
		res.status(500).json({
			status: "Something went wrong, please try again",
			msg: error,
		});
	}
};

module.exports = {
	register,
	login,
};
