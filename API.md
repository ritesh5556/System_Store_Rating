# API Documentation

## Store Rating System API Endpoints

### Authentication

| Endpoint          | Method | Description                | Request Body                         |
|-------------------|--------|----------------------------|--------------------------------------|
| `/api/auth/signup`| POST   | Register a new user        | `{name, email, password, role}`      |
| `/api/auth/login` | POST   | Login and get token        | `{email, password}`                  |
| `/api/auth/me`    | GET    | Get current user profile   | -                                    |
| `/api/auth/password-update` | POST | Update password    | `{currentPassword, newPassword}`     |

### Stores

| Endpoint                  | Method | Description                | Access Level  |
|---------------------------|--------|----------------------------|---------------|
| `/api/stores`             | GET    | Get all stores             | Public        |
| `/api/stores`             | POST   | Create a store             | Store Owner   |
| `/api/stores/:id`         | GET    | Get store by ID            | Public        |
| `/api/stores/:id`         | PUT    | Update store               | Store Owner   |
| `/api/stores/:id`         | DELETE | Delete store               | Store Owner   |
| `/api/stores/:id/ratings` | GET    | Get ratings for a store    | Public        |
| `/api/stores/:id/ratings` | POST   | Rate a store               | User          |

### User

| Endpoint                    | Method | Description                | Access Level  |
|-----------------------------|--------|----------------------------|---------------|
| `/api/users/profile`        | GET    | Get user profile           | User          |
| `/api/users/profile`        | PUT    | Update user profile        | User          |
| `/api/users/ratings`        | GET    | Get user's ratings         | User          |

### Admin

| Endpoint                    | Method | Description                | Access Level  |
|-----------------------------|--------|----------------------------|---------------|
| `/api/admin/users`          | GET    | Get all users              | Admin         |
| `/api/admin/users`          | POST   | Create a user              | Admin         |
| `/api/admin/users/:id`      | GET    | Get user by ID             | Admin         |
| `/api/admin/users/:id`      | PUT    | Update user                | Admin         |
| `/api/admin/users/:id`      | DELETE | Delete user                | Admin         |
| `/api/admin/stores`         | GET    | Get all stores (admin)     | Admin         |
| `/api/admin/stores`         | POST   | Create a store (admin)     | Admin         |
| `/api/admin/stores/:id`     | DELETE | Delete store (admin)       | Admin         |
| `/api/admin/dashboard`      | GET    | Get dashboard statistics   | Admin         |

### Store Owner

| Endpoint                    | Method | Description                | Access Level  |
|-----------------------------|--------|----------------------------|---------------|
| `/api/stores/owner/profile` | GET    | Get store owner profile    | Store Owner   |
| `/api/stores/owner/profile` | PUT    | Update store owner profile | Store Owner   |
| `/api/stores/owner/dashboard`| GET   | Get owner dashboard stats  | Store Owner   |

## Authentication

API requests (except public endpoints) require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

Successful responses have the following format:
```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message"
}
```
