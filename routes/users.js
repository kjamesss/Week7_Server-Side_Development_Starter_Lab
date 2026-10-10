const express = require("express");
const User = require("../models/User");

const router = express.Router();
const editableFields = ["name", "email", "age"];

function pickEditableFields(body) {
	return Object.fromEntries(
		editableFields
			.filter((field) => Object.hasOwn(body, field))
			.map((field) => [field, body[field]])
	);
}

router.post("/", async (req, res) => {
	try {
		const user = await User.create(pickEditableFields(req.body));
		return res.status(201).json(user);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
});

router.get("/", async (req, res) => {
	try {
		const users = await User.find().sort({ createdAt: -1 });
		return res.json(users);
	} catch (error) {
		return res.status(500).json({ error: "Unable to load users" });
	}
});

router.put("/:id", async (req, res) => {
	try {
		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			pickEditableFields(req.body),
			{ new: true, runValidators: true }
		);

		if (!updatedUser) {
			return res.status(404).json({ error: "User not found" });
		}

		return res.json(updatedUser);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const deletedUser = await User.findByIdAndDelete(req.params.id);

		if (!deletedUser) {
			return res.status(404).json({ error: "User not found" });
		}

		return res.json({ message: "User deleted" });
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
});

module.exports = router;
