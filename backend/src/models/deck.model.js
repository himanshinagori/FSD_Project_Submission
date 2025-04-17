import mongoose, { Schema } from "mongoose";

const deckSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    cards: [
      {
        type: Schema.Types.ObjectId,
        ref: "Card",
      },
    ],
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "public",
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    favorites: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Deck = mongoose.model("Deck", deckSchema);
export default Deck;
