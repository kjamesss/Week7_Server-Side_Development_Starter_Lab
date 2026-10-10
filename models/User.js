const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		age: { type: Number, default: null, min: 1 },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
