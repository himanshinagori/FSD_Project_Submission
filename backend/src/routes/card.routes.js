import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createCard,
  updateCard,
  deleteCard,
  getCard,
  getUserCards,
} from "../controllers/card.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/").post(createCard).get(getUserCards);

router.route("/:id").get(getCard).put(updateCard).delete(deleteCard);

router.route("/getUserCards").get(getUserCards);

export default router;
