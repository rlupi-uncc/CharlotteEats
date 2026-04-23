# CharlotteEats

CharlotteEats is a full-stack web application that allows users to browse restaurants, view menus, leave reviews, and manage reservations. This project was developed as part of a college capstone and focuses on authentication, database integration, and interactive user features.

**Live App:**  
https://charlotteeats-itsc-4155-003-group-1.onrender.com/

---

## Features

- User authentication with protected routes
- Browse restaurants and view menu items
- Leave, update, and delete reviews
- Create and manage restaurant reservations
- View reservations on the user profile page
- Cancel or delete reservations
- Rating system with automatic average calculation

---

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- EJS templating
- JavaScript (frontend and backend)
- CSS

---

## Project Structure

```
models/        # Mongoose schemas
routes/        # Express route definitions
controllers/   # Route handlers
services/      # Business logic
repositories/  # Database interaction
middleware/    # Validation and authentication
views/         # EJS templates
public/        # Frontend JS and CSS
```

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/rlupi-uncc/CharlotteEats
cd CharlotteEats
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=time_to_expire
```

### 4. Runs this script BEFORE starting the server, delete after running ONCE
fixReviewCounts.js (place the file on the same level as db.js)
```require("dotenv").config();

const { connectMongo } = require('./db.js');
const User = require('./models/User.js');
const Restaurant = require('./models/Restaurant.js');

async function fixReviewCounts() {
  try {
    await connectMongo();

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      // Count reviews for this user
      const reviewCount = await Restaurant.countDocuments({ 'reviews.userId': user._id });
      console.log(`User ${user.username} has ${reviewCount} reviews in DB`);
      user.reviewCount = reviewCount;
      await user.save();
      console.log(`Updated ${user.username}: ${reviewCount} reviews`);
    }

    console.log('Review counts fixed!');
  } catch (error) {
    console.error('Error fixing review counts:', error);
  } finally {
    process.exit(0);
  }
}

fixReviewCounts();
```

### 5. Start the server
```bash
node server.js
```

### 6. Open the application

http://localhost:8000

---

## Usage

- Register or log in to access full functionality
- Browse restaurants and menus
- Leave reviews on restaurant pages
- Make reservations using the reservation form
- View and manage reservations from the profile page

---

## Testing

Run unit tests with:

```bash
npm test
```

Tests are written using Jest and focus on backend logic.
