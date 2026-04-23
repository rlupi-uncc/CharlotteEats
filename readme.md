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

### 4. Start the server
```bash
node server.js
```

### 5. Open the application

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
