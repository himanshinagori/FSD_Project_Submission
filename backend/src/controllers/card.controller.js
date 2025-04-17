import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Card from "../models/card.model.js";
import mongoose from "mongoose";

const createCard = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    throw new ApiError(400, "Title and content are required");
  }

  const card = await Card.create({
    title,
    content,
    created_by: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, card, "Card created successfully"));
});

const updateCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title && !content) {
    throw new ApiError(400, "At least one field is required for update");
  }

  const card = await Card.findOneAndUpdate(
    { _id: id, created_by: req.user._id },
    {
      $set: {
        title: title || undefined,
        content: content || undefined,
        updated_at: Date.now(),
      },
    },
    { new: true }
  );

  if (!card) {
    throw new ApiError(404, "Card not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, card, "Card updated successfully"));
});

const deleteCard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const card = await Card.findOneAndDelete({
    _id: id,
    created_by: req.user._id,
  });

  if (!card) {
    throw new ApiError(404, "Card not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, card, "Card deleted successfully"));
});

const getCard = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid card ID");
    }

    const card = await Card.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "created_by",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $unwind: "$creator",
      },
      {
        $addFields: {
          created_by: "$creator.name",
        },
      },
      {
        $project: {
          "creator.password": 0, // Exclude the password field from the final output
          "creator.__v": 0, // Exclude the __v field from the final output
        },
      },
    ]);

    if (!card.length) {
      throw new ApiError(404, "Card not found or unauthorized");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, card[0], "Card fetched successfully"));
  } catch (error) {
    console.error("Error retrieving card:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

const getUserCards = asyncHandler(async (req, res) => {
  const cards = await Card.find({ created_by: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, cards, "User cards fetched successfully"));
});

export { createCard, updateCard, deleteCard, getCard, getUserCards };
