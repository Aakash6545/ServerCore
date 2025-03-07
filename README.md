# ServerCore

## Description

ServerCore is a Node.js-based backend application built using Express.js and MongoDB. It includes user authentication, file uploads, and API endpoints for managing users and videos. This project is designed for learning and practicing backend development.

## Features

- **User Authentication:** Register, login, logout, refresh tokens, and update user details.
- **Secure Passwords:** Uses bcrypt for password hashing.
- **File Uploads:** Multer is used for handling user avatar and cover image uploads.
- **Cloud Storage:** Cloudinary is used for storing images and videos.
- **Database Management:** MongoDB is used to store user and video data with Mongoose as the ODM.
- **Middleware:** Includes authentication middleware to protect secure routes.
- **Async Error Handling:** Utilizes centralized error handling using custom error classes.
- **Environment Configuration:** Uses dotenv to manage environment variables.

## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB & Mongoose**
- **Cloudinary**
- **Multer**
- **JWT Authentication**
- **bcrypt**

## Installation

### Prerequisites

Ensure you have the following installed:

- Node.js
- MongoDB
- Cloudinary Account (for storing images and videos)

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Aakash6545/ServerCore.git
   cd ServerCore
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the following environment variables:

   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ACCESS_TOKEN_EXPIRY=1h
   REFRESH_TOKEN_EXPIRY=7d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Start the server:

   ```bash
   npm start
   ```

## API Endpoints

### User Routes

| Method | Endpoint                      | Description                    |
| ------ | ----------------------------- | ------------------------------ |
| POST   | `/api/users/register`         | Register a new user            |
| POST   | `/api/users/login`            | User login                     |
| POST   | `/api/users/logout`           | Logout user                    |
| POST   | `/api/users/refresh-tokens`   | Refresh access & refresh token |
| POST   | `/api/users/change-password`  | Change current password        |
| POST   | `/api/users/get-current-user` | Get current user details       |
| POST   | `/api/users/update-details`   | Update user details            |
| POST   | `/api/users/update-avatar`    | Update user avatar             |
| POST   | `/api/users/update-cover`     | Update user cover image        |

### Middleware

- **Authentication Middleware (**``**)**: Protects secure routes by verifying JWT.
- **Multer Middleware (**``**)**: Handles file uploads.

## Project Structure

```
chai-backend/
├── src/
│   ├── controllers/      # Handles business logic
│   ├── db/               # Database connection setup
│   ├── middlewares/      # Middleware functions
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   ├── app.js            # Express app configuration
│   ├── index.js          # Entry point
│   ├── envConfig.js      # Loads environment variables
│   ├── constants.js      # Constant values
├── package.json          # Project dependencies
├── .env                  # Environment variables
├── README.md             # Project documentation
```


## License

This project is licensed under the ISC License.


