import Deck from "../models/deck.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
ApiError;
import mongoose from "mongoose";
import { sendEmail } from "../utils/email.js";
import { User } from "../models/user.model.js";

const createDeck = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) {
    throw new ApiError(400, "title is required");
  }

  const deck = await Deck.create({
    title,
    cards: [],
    created_by: req.user._id,
  });
  // console.log(deck);
  return res
    .status(201)
    .json(new ApiResponse(201, deck, "Deck created successfully"));
});

const updateDeck = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, cards } = req.body;

  if (!title && !cards) {
    throw new ApiError(400, "At least one field is required for update");
  }

  const deck = await Deck.findOneAndUpdate(
    { _id: id, created_by: req.user._id },
    {
      $set: {
        title: title || undefined,
        cards: cards || undefined,
        updated_at: Date.now(),
      },
    },
    { new: true }
  );

  if (!deck) {
    throw new ApiError(404, "Deck not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deck, "Deck updated successfully"));
});

const deleteDeck = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deck = await Deck.findOneAndDelete({
    _id: id,
    created_by: req.user._id,
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deck, "Deck deleted successfully"));
});

const getDeck = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid deck ID");
    }

    const deck = await Deck.aggregate([
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
        $lookup: {
          from: "cards",
          localField: "cards",
          foreignField: "_id",
          as: "cards",
        },
      },
      {
        $unwind: {
          path: "$cards",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "cards.created_by",
          foreignField: "_id",
          as: "card_creator",
        },
      },
      {
        $unwind: {
          path: "$card_creator",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "cards.created_by": "$card_creator.name",
        },
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          cards: { $push: "$cards" },
          created_by: { $first: "$created_by" },
          visibility: { $first: "$visibility" },
          is_blocked: { $first: "$is_blocked" },
          favorites: { $first: "$favorites" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "favorites",
          foreignField: "_id",
          as: "favorites",
        },
      },
      {
        $project: {
          "favorites.email": 1,
          "favorites.name": 1,
          title: 1,
          cards: 1,
          created_by: 1,
          visibility: 1,
          is_blocked: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!deck.length) {
      throw new ApiError(404, "Deck not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, deck[0], "Deck retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving deck:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const deck = await Deck.findById(id);
  if (!deck) {
    throw new ApiError(404, "Deck not found");
  }

  const favoriteIndex = deck.favorites.indexOf(userId);

  if (favoriteIndex === -1) {
    deck.favorites.push(userId);
    await deck.save();
    return res
      .status(200)
      .json(new ApiResponse(200, deck, "Added to favorites"));
  } else {
    deck.favorites.splice(favoriteIndex, 1);
    await deck.save();
    return res
      .status(200)
      .json(new ApiResponse(200, deck, "Removed from favorites"));
  }
});

const getFavoriteDecks = asyncHandler(async (req, res) => {
  const decks = await Deck.aggregate([
    {
      $match: {
        favorites: req.user._id,
        is_blocked: false,
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
        creator: 0, // Exclude the creator field from the final output
      },
    },
    {
      $lookup: {
        from: "cards",
        localField: "cards",
        foreignField: "_id",
        as: "cards",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "favorites",
        foreignField: "_id",
        as: "favorites",
      },
    },
    {
      $project: {
        "favorites.email": 1,
        title: 1,
        cards: 1,
        created_by: 1,
        visibility: 1,
        is_blocked: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, decks, "Favorite decks retrieved successfully"));
});

const getPublicDecks = asyncHandler(async (req, res) => {
  const decks = await Deck.aggregate([
    {
      $match: {
        visibility: "public",
        is_blocked: false,
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
        creator: 0, // Exclude the creator field from the final output
      },
    },
    {
      $lookup: {
        from: "cards",
        localField: "cards",
        foreignField: "_id",
        as: "cards",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "favorites",
        foreignField: "_id",
        as: "favorites",
      },
    },
    {
      $project: {
        "favorites.username": 1,
        "favorites.email": 1,
        title: 1,
        cards: 1,
        created_by: 1,
        visibility: 1,
        is_blocked: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, decks, "Public decks retrieved successfully"));
});

const addCardToDeck = asyncHandler(async (req, res) => {
  const { deckId } = req.params;
  const { cardId } = req.body;

  if (!cardId) {
    throw new ApiError(400, "Card ID is required");
  }

  const deck = await Deck.findOne({
    _id: deckId,
    created_by: req.user._id,
  });

  if (!deck) {
    throw new ApiError(404, "Deck not found or unauthorized");
  }

  if (deck.cards.includes(cardId)) {
    throw new ApiError(400, "Card already exists in deck");
  }

  deck.cards.push(cardId);
  await deck.save();

  const updatedDeck = await Deck.findById(deckId)
    .populate("cards")
    .populate("favorites", "username email");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedDeck, "Card added to deck successfully"));
});

const searchDecks = asyncHandler(async (req, res) => {
  const {
    title,
    exactMatch = false,
    cardsCount,
    favoritesCount,
    postedAfter,
  } = req.query;

  try {
    const pipeline = [
      // Initial match for public decks
      {
        $match: {
          visibility: "public",
          is_blocked: false,
        },
      },
    ];

    if (title) {
      pipeline.push({
        $match: {
          title:
            exactMatch === "true" ? title : { $regex: title, $options: "i" },
        },
      });
    }

    pipeline.push({
      $addFields: {
        cardsCount: { $size: "$cards" },
      },
    });

    if (cardsCount) {
      pipeline.push({
        $match: {
          cardsCount: { $gte: parseInt(cardsCount) },
        },
      });
    }

    if (postedAfter) {
      pipeline.push({
        $match: {
          createdAt: { $gte: new Date(postedAfter) },
        },
      });
    }

    pipeline.push({
      $addFields: {
        favoritesCount: { $size: "$favorites" },
      },
    });

    if (favoritesCount) {
      pipeline.push({
        $match: {
          favoritesCount: { $gte: parseInt(favoritesCount) },
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "created_by",
        foreignField: "_id",
        as: "creator",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$creator",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Add the creator's name into the created_by field
    pipeline.push({
      $addFields: {
        created_by: "$creator.name",
      },
    });

    // Optionally, exclude the creator field if not needed
    pipeline.push({
      $project: {
        title: 1,
        cardsCount: 1,
        created_by: 1,
        createdAt: 1,
        favoritesCount: 1,
        // Remove the creator field if you don't need it
        // creator: 0,
      },
    });

    const decks = await Deck.aggregate(pipeline);

    return res
      .status(200)
      .json(
        new ApiResponse(200, decks, "Search results retrieved successfully")
      );
  } catch (error) {
    console.error("Error in searchDecks:", error);
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
});

const getUserDecks = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const decks = await Deck.aggregate([
      {
        $match: {
          created_by: new mongoose.Types.ObjectId(userId),
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
        $lookup: {
          from: "cards",
          localField: "cards",
          foreignField: "_id",
          as: "cards",
        },
      },
      {
        $unwind: {
          path: "$cards",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "cards.created_by",
          foreignField: "_id",
          as: "card_creator",
        },
      },
      {
        $unwind: {
          path: "$card_creator",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "cards.created_by": "$card_creator.name",
        },
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          cards: { $push: "$cards" },
          created_by: { $first: "$created_by" },
          visibility: { $first: "$visibility" },
          is_blocked: { $first: "$is_blocked" },
          favorites: { $first: "$favorites" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "favorites",
          foreignField: "_id",
          as: "favorites",
        },
      },
      {
        $project: {
          "favorites.email": 1,
          "favorites.name": 1,
          title: 1,
          cards: 1,
          created_by: 1,
          visibility: 1,
          is_blocked: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!decks.length) {
      throw new ApiError(404, "No decks found for this user");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, decks, "User decks retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving user decks:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

const softDeleteDeck = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reasons } = req.body;
  if (!reasons) {
    throw new ApiError(400, "Reasons for blocking the deck is required");
  }

  const deck = await Deck.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        is_blocked: true,
        updated_at: Date.now(),
      },
    },
    { new: true }
  );

  if (!deck) {
    throw new ApiError(404, "Deck not found or unauthorized");
  }

  const creator = await User.findById(deck.created_by);

  const htmlMessage = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Deck Blocked Notification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .content {
          padding: 20px;
          background-color: #fff;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          font-size: 0.9em;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Deck Blocked Notification</h2>
        </div>
        <div class="content">
          <p>Dear ${creator.name},</p>
          <p>We regret to inform you that your deck titled <strong>${deck.title}</strong> has been blocked for the following reasons:</p>
          <p>${reasons}</p>
          <p>Please contact the admin for more information.</p>
          <p>Thank you for your understanding.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 BuddyBoard. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (creator) {
    await sendEmail({
      email: creator.email,
      subject: "Deck Blocked",
      message: `Your deck ${deck.title} has been blocked for ${reasons}. Please contact the admin for more information.`,
      html: htmlMessage,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deck, "Deck soft deleted successfully"));
});

export {
  createDeck,
  updateDeck,
  deleteDeck,
  getDeck,
  toggleFavorite,
  getFavoriteDecks,
  getPublicDecks,
  addCardToDeck,
  searchDecks,
  getUserDecks,
  softDeleteDeck,
};
