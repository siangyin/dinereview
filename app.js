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
const restaurantRouter = require("./routes/restaurantRouter");
const reviewRouter = require("./routes/reviewRouter");
const userRouter = require("./routes/userRouter");

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/restaurant", restaurantRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/user", userRouter);

app.get("/index.html", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.use((req, res) => res.status(404).send(`Route ${req.path}does not exist`));

app.listen(PORT, () => console.log("server run on", PORT));
