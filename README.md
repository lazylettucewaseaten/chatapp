# Chatapp
Will add new features soon :)

## Demo
https://super-piroshki-a4ca5a.netlify.app/chat

## Features
- **WebSocket** for real-time communication between clients and the server.
- **JWT (JSON Web Token)** for secure user authentication and session management.
- **Password Hashing** using bcrypt for safe password storage.
- **AES-256 Encryption** for end-to-end encryption of messages.
- **MongoDB** for storing user data and messages.

## SetUp 
- Cretae ur .env file for them
- PORT=3000
- MONGO_URI=mongodb://localhost:27017/chatapp
- JWT_SECRET=your_secret_key_for_jwt
- AES_SECRET_KEY=your_secret_key_for_aes

## Make two folder one containing client other containing everything except client

- npm run dev to run the client[frontend]
- node app.js to run the backend
