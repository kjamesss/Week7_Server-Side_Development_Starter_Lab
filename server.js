const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const usersRouter = require("./routes/users");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/users", usersRouter);

app.get("/api/health", (req, res) => {
	res.json({ status: "ok" });
});

async function start() {
	if (!process.env.MONGO_URI) {
		console.error("Startup error: MONGO_URI is not set in the environment");
		process.exit(1);
	}

	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("MongoDB connected");

		const port = process.env.PORT || 3000;
		app.listen(port, () => console.log(`Server running on port ${port}`));
	} catch (error) {
		console.error("Startup error:", error.message);
		process.exit(1);
	}
}

start();
