"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./config/db");
const initDb_1 = __importDefault(require("./utils/initDb"));
// Load environment variables
dotenv_1.default.config();
// Connect to database
(0, db_1.connectDB)().then(() => {
    // Initialize database with tables and seed data
    (0, initDb_1.default)();
});
// Initialize express app
const app = (0, express_1.default)();
const PORT = process.env.PORT;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const store_routes_1 = __importDefault(require("./routes/store.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/stores', store_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Health check route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Store Rating System API',
    });
});
// Handle undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`,
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
