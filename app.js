require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;

app.use(express.static("./public"));
// to parse the body from post/fetch request
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// ROUTES
const authRouter = require("./routes/authRouter");

app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, () => console.log("server run on", PORT));
