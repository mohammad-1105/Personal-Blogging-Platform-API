# Personal Blogging Platform API

This project is a backend API for a personal blogging platform. It provides endpoints for user authentication and blog post management, including features like user registration, login, password management, avatar updates, bio updates, and blog post CRUD operations.

## **Features**

- **User registration, login, and logout**
- **Password change functionality**
- **Avatar upload and update using Cloudinary**
- **Bio update**
- **Blog post creation, retrieval, updating, and deletion**
- **Fetching posts by tag and author details**

## **Technologies Used**

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: NoSQL database for storing user and blog post data.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.
- **JWT (jsonwebtoken)**: For authentication and authorization.
- **Multer**: Middleware for handling `multipart/form-data`, primarily used for uploading files.
- **Cloudinary**: Cloud service for image and video management.
- **Zod**: TypeScript-first schema declaration and validation library.
- **bcryptjs**: Library to hash passwords.
- **crypto**: Node.js built-in library for cryptographic operations.
- **cookie-parser**: Middleware to parse cookie header and populate `req.cookies`.
- **CORS (cors)**: Middleware for enabling Cross-Origin Resource Sharing.
- **dotenv**: Module to load environment variables from a `.env` file.
- **nodemon**: Tool that helps develop Node.js applications by automatically restarting the node application when file changes are detected.
- **prettier**: Code formatter to ensure consistent code style.

## **Installation**

1. **Clone the repository:**

```javascript
   git clone https://github.com/mohammad-1105/Personal-Blogging-Platform-API.git
   cd Personal-Bloggin-Platform-Api

```

2. **Install dependencies:**

```javascript
   npm install

```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following variables:

```javascript
   PORT=8000
   MONGODB_URI=<your-mongodb-uri>
   CORS_ORIGIN=<your-cors-origin>

   ACCESS_TOKEN_SECRET=<your-access-token-secret>
   ACCESS_TOKEN_SECRET_EXPIRY=<your-access-token-secret-expiry>
   REFRESH_ACCESS_TOKEN_SECRET=<your-refresh-token-secret>
   REFRESH_ACCESS_TOKEN_SECRET_EXPIRY=<your-refresh-token-expiry>

   CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

4. **Start the server:**

```javascript
   npm start
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
