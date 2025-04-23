# Environment Variables for Frontend

This document explains the environment variables used in the frontend of the Store Rating System.

## Available Environment Variables

| Variable              | Description                                  | Default Value           |
|-----------------------|----------------------------------------------|-------------------------|
| REACT_APP_API_URL     | The base URL of the backend API              | http://localhost:5000/api |
| REACT_APP_NAME        | The name of the application                  | Store Rating System     |
| REACT_APP_ENVIRONMENT | The current environment (development/production) | development         |
| PORT                  | The port on which the frontend server runs   | 3000                    |

## How to Use

### Development

1. Create a `.env` file in the root of the `frontend` directory
2. Add the environment variables you want to override
3. Restart the development server

Example `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
PORT=3000
```

### Production

For production builds, you can set these environment variables:

```
REACT_APP_API_URL=https://your-production-api.com/api
REACT_APP_ENVIRONMENT=production
```

## Important Notes

- In Create React App, only environment variables prefixed with `REACT_APP_` will be exposed to your JavaScript code.
- Environment variables are embedded during the build time. If you need to change them, you need to rebuild your application.
- The `.env` file should be added to `.gitignore` to avoid exposing sensitive information in the repository. 