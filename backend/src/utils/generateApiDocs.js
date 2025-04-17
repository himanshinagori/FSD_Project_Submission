import PDFDocument from "pdfkit";
import fs from "fs";

const doc = new PDFDocument({ bufferPages: true });

doc.pipe(fs.createWriteStream("API_Documentation.pdf"));

// Title
doc.fontSize(20).text("API Documentation", { align: "center" });
doc.moveDown();

// Table of Contents
doc.fontSize(16).text("Table of Contents", { underline: true });
doc.moveDown();
doc
  .fontSize(12)
  .text("1. User Routes", { link: "#user-routes", underline: true });
doc.text("2. Deck Routes", { link: "#deck-routes", underline: true });
doc.text("3. Card Routes", { link: "#card-routes", underline: true });
doc.addPage();

// User Routes
doc.addNamedDestination("user-routes");
doc.fontSize(16).text("User Routes", { underline: true });
doc.moveDown();
doc.fontSize(12).text("1. Sign Up");
doc.text("POST /api/users/signup");
doc.text(
  'Request Body: { "name": "John Doe", "email": "john@example.com", "password": "password123" }'
);
doc.text(
  'Response: { "user": { "id": "123", "name": "John Doe", "email": "john@example.com" }, "token": "jwt-token" }'
);
doc.moveDown();

doc.text("2. Sign In");
doc.text("POST /api/users/signin");
doc.text(
  'Request Body: { "email": "john@example.com", "password": "password123" }'
);
doc.text(
  'Response: { "user": { "id": "123", "name": "John Doe", "email": "john@example.com" }, "token": "jwt-token" }'
);
doc.moveDown();

doc.text("3. Verify Email");
doc.text("GET /api/users/verifyEmail/:token");
doc.text('Response: { "message": "Email verified successfully" }');
doc.moveDown();

doc.text("4. Send Password Reset Email");
doc.text("POST /api/users/sendPasswordResetEmail");
doc.text('Request Body: { "email": "john@example.com" }');
doc.text('Response: { "message": "Password reset email sent" }');
doc.moveDown();

doc.text("5. Reset Password");
doc.text("POST /api/users/resetPassword");
doc.text(
  'Request Body: { "token": "reset-token", "newPassword": "newpassword123" }'
);
doc.text('Response: { "message": "Password reset successfully" }');
doc.moveDown();

doc.text("6. Get User");
doc.text("GET /api/users/getUser/:userId");
doc.text('Headers: { "Authorization": "Bearer jwt-token" }');
doc.text(
  'Response: { "user": { "id": "123", "name": "John Doe", "email": "john@example.com" } }'
);
doc.moveDown();

doc.text("7. Search Users (Admin Only)");
doc.text("GET /api/users/searchUser");
doc.text('Headers: { "Authorization": "Bearer jwt-token" }');
doc.text(
  'Query Params: { "name": "John", "exactMatch": "false", "likesCount": "10", "decksCount": "5", "joinedAfter": "2023-01-01", "role": "user" }'
);
doc.text(
  'Response: { "users": [ { "id": "123", "name": "John Doe", "email": "john@example.com", "likesCount": 10, "decksCount": 5 } ] }'
);
doc.addPage();

// Deck Routes
doc.addNamedDestination("deck-routes");
doc.fontSize(16).text("Deck Routes", { underline: true });
doc.moveDown();
doc.fontSize(12).text("1. Create Deck");
doc.text("POST /api/decks");
doc.text('Request Body: { "title": "New Deck" }');
doc.text(
  'Response: { "deck": { "id": "123", "title": "New Deck", "created_by": "user-id" } }'
);
doc.moveDown();

doc.text("2. Update Deck");
doc.text("PUT /api/decks/:id");
doc.text(
  'Request Body: { "title": "Updated Deck Title", "cards": ["card-id-1", "card-id-2"] }'
);
doc.text(
  'Response: { "deck": { "id": "123", "title": "Updated Deck Title", "cards": ["card-id-1", "card-id-2"] } }'
);
doc.moveDown();

doc.text("3. Delete Deck (Admin Only)");
doc.text("DELETE /api/decks/:id");
doc.text('Headers: { "Authorization": "Bearer jwt-token" }');
doc.text('Response: { "message": "Deck soft deleted successfully" }');
doc.moveDown();

doc.text("4. Get Deck");
doc.text("GET /api/decks/:id");
doc.text(
  'Response: { "deck": { "id": "123", "title": "Deck Title", "created_by": "user-id" } }'
);
doc.moveDown();

doc.text("5. Get Public Decks");
doc.text("GET /api/decks/public");
doc.text(
  'Response: { "decks": [ { "id": "123", "title": "Deck Title", "created_by": "user-id" } ] }'
);
doc.moveDown();

doc.text("6. Get Favorite Decks");
doc.text("GET /api/decks/favorites");
doc.text('Headers: { "Authorization": "Bearer jwt-token" }');
doc.text(
  'Response: { "decks": [ { "id": "123", "title": "Deck Title", "created_by": "user-id" } ] }'
);
doc.moveDown();

doc.text("7. Toggle Favorite");
doc.text("POST /api/decks/:id/favorite");
doc.text('Headers: { "Authorization": "Bearer jwt-token" }');
doc.text(
  'Response: { "deck": { "id": "123", "title": "Deck Title", "favorites": ["user-id"] } }'
);
doc.moveDown();

doc.text("8. Add Card to Deck");
doc.text("POST /api/decks/:deckId/cards");
doc.text('Request Body: { "cardId": "card-id" }');
doc.text(
  'Response: { "deck": { "id": "123", "title": "Deck Title", "cards": ["card-id"] } }'
);
doc.moveDown();

doc.text("9. Search Decks");
doc.text("GET /api/decks/search");
doc.text(
  'Query Params: { "title": "Deck Title", "exactMatch": "false", "cardsCount": "10", "favoritesCount": "5", "postedAfter": "2023-01-01" }'
);
doc.text(
  'Response: { "decks": [ { "id": "123", "title": "Deck Title", "cardsCount": 10, "favoritesCount": 5 } ] }'
);
doc.moveDown();

doc.text("10. Get User Decks");
doc.text("GET /api/decks/getUserDecks");
doc.text('Headers: { "Authorization": "Bearer jwt-token" }');
doc.text(
  'Response: { "decks": [ { "id": "123", "title": "Deck Title", "created_by": "user-id" } ] }'
);
doc.addPage();

// Card Routes
doc.addNamedDestination("card-routes");
doc.fontSize(16).text("Card Routes", { underline: true });
doc.moveDown();
doc.fontSize(12).text("1. Create Card");
doc.text("POST /api/cards");
doc.text('Request Body: { "title": "New Card", "content": "Card content" }');
doc.text(
  'Response: { "card": { "id": "123", "title": "New Card", "content": "Card content", "created_by": "user-id" } }'
);
doc.moveDown();

doc.text("2. Update Card");
doc.text("PUT /api/cards/:id");
doc.text(
  'Request Body: { "title": "Updated Card Title", "content": "Updated content" }'
);
doc.text(
  'Response: { "card": { "id": "123", "title": "Updated Card Title", "content": "Updated content" } }'
);
doc.moveDown();

doc.text("3. Delete Card");
doc.text("DELETE /api/cards/:id");
doc.text('Headers: { "Authorization": "Bearer jwt-token" }');
doc.text('Response: { "message": "Card deleted successfully" }');
doc.moveDown();

doc.text("4. Get Card");
doc.text("GET /api/cards/:id");
doc.text(
  'Response: { "card": { "id": "123", "title": "Card Title", "content": "Card content" } }'
);
doc.moveDown();

doc.text("5. Get User Cards");
doc.text("GET /api/cards/getUserCards");
doc.text('Headers: { "Authorization": "Bearer jwt-token" }');
doc.text(
  'Response: { "cards": [ { "id": "123", "title": "Card Title", "content": "Card content" } ] }'
);
doc.moveDown();

doc.end();
