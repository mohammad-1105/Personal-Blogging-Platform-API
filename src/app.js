import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

// middlewares
app.use(
  express.json({
    limit: "18kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "18kb",
  })
);
app.use(express.static("public"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(cookieParser());


// import routes
import { router as userRouter } from "./routes/user.route.js";
import { router as blogPostRouter } from "./routes/blogPost.route.js"


// routes declaration [ Api version 1  ]
// user route
app.use("/api/v1/user", userRouter);


// blog post route
app.use("/api/v1/blog", blogPostRouter)
