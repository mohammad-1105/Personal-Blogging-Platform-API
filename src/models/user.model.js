import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: [true, "fullName is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "password is required"],
    },

    profile: {
      avatar: {
        type: String, // cloudinary
        default: "https://placehold.co/80x80",
      },
      bio: {
        type: String,
      },
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10);

  next();
});

// check password correct method
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

// generate access token method
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },

    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRY,
    }
  );
};

// generate refresh access token method
userSchema.methods.generateRefreshAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },

    process.env.REFRESH_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_ACCESS_TOKEN_SECRET_EXPIRY,
    }
  );
};

export const UserModel = mongoose.model("User", userSchema);
