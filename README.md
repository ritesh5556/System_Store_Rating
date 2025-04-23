# Store Rating System

A full-stack application for managing and rating stores, with separate interfaces for users, store owners, and administrators.

## Live Demo

🌐 [https://store-rating-stystem.vercel.app](https://store-rating-stystem.vercel.app)

## Overview

The Store Rating System allows:
- **Users** to browse stores and submit ratings/reviews
- **Store Owners** to manage their store listings and view performance metrics
- **Administrators** to oversee all users, stores, and system analytics

## Technology Stack

### Frontend
- React.js with TypeScript
- Redux for state management
- Material-UI (MUI) components
- Axios for API requests

### Backend
- Node.js with Express
- PostgreSQL database (Neon DB)
- JWT authentication
- RESTful API architecture

## Project Structure

```
├── frontend/       # React frontend application
├── backend/        # Node.js backend API
├── API.md          # API documentation
└── README.md       # Project overview and instructions
```

## Installation

### Prerequisites
- Node.js (v14+)
- PostgreSQL database (or Neon DB account)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the environment variables file:
   ```
   cp .env.example .env
   ```
4. Configure your `.env` file with your PostgreSQL/Neon DB credentials
5. Run database migrations:
   ```
   npm run migrate
   ```
6. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the environment variables file:
   ```
   cp .env.example .env
   ```
4. Configure your `.env` file with your backend API URL
5. Start the development server:
   ```
   npm start
   ```

## API Documentation

See [API.md](API.md) for detailed API documentation.

## Key Features

- User authentication with role-based access
- Store rating system with comments
- Responsive design for all device sizes
- Real-time statistics and data visualization
- Search and filter functionality

## License

MIT

## Author

Ritesh 