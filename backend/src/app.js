import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to BuddyBoard!");
});

import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
app.use("/api/auth/users", userRouter);

import cardRouter from "./routes/card.routes.js";
app.use("/api/card", cardRouter);

import deckRouter from "./routes/deck.routes.js";
app.use("/api/deck", deckRouter);

app.use(errorHandler);

export { app };
