import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

// Types
export interface User {
    id: number;
    name: string;
    email: string;
    address: string;
    role: 'admin' | 'user' | 'store_owner';
}

export interface Rating {
    id: number;
    storeId?: number;
    userId?: number;
    store_id?: number;
    user_id?: number;
    rating: number;
    comment?: string;
    store?: {
        id: number;
        name: string;
        address: string;
    };
    user?: {
        id: number;
        name: string;
        email: string;
    };
    createdAt?: string;
    created_at?: string;
}

interface UserState {
    users: User[];
    currentUser: User | null;
    userRatings: Rating[];
    loading: boolean;
    error: string | null;
    success: boolean;
}

// Initial state
const initialState: UserState = {
    users: [],
    currentUser: null,
    userRatings: [],
    loading: false,
    error: null,
    success: false,
};

// Get auth token config
const getConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Async Thunks for Normal User
export const getUserProfile = createAsyncThunk(
    'user/getUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/users/profile`, getConfig());
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch user profile'
            );
        }
    }
);

export interface UpdateProfileData {
    name?: string;
    email?: string;
    address?: string;
}

export const updateUserProfile = createAsyncThunk(
    'user/updateUserProfile',
    async (data: UpdateProfileData, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_URL}/users/profile`,
                data,
                getConfig()
            );
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update profile'
            );
        }
    }
);

export const getUserRatings = createAsyncThunk(
    'user/getUserRatings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/users/ratings`, getConfig());
            // Ensure we always return an array, even if the backend returns null or undefined
            return response.data.data || [];
        } catch (error: any) {
            console.error('Error fetching user ratings:', error);
            // Return an empty array instead of rejecting
            return [];
        }
    }
);

// Async Thunks for Admin
export const getAllUsers = createAsyncThunk(
    'user/getAllUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/admin/users`, getConfig());
            return response.data.data || [];
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch users'
            );
        }
    }
);

export const getUserById = createAsyncThunk(
    'user/getUserById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_URL}/admin/users/${id}`,
                getConfig()
            );
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch user'
            );
        }
    }
);

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    address: string;
    role: 'admin' | 'user' | 'store_owner';
}

export const createUser = createAsyncThunk(
    'user/createUser',
    async (data: CreateUserData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_URL}/admin/users`,
                data,
                getConfig()
            );
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create user'
            );
        }
    }
);

export const updateUser = createAsyncThunk(
    'user/updateUser',
    async (
        { id, data }: { id: number; data: Partial<CreateUserData> },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.put(
                `${API_URL}/admin/users/${id}`,
                data,
                getConfig()
            );
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update user'
            );
        }
    }
);

export const deleteUser = createAsyncThunk(
    'user/deleteUser',
    async (id: number, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/admin/users/${id}`, getConfig());
            return id;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete user'
            );
        }
    }
);

// Update password
export interface UpdatePasswordData {
    currentPassword: string;
    newPassword: string;
}

export const updatePassword = createAsyncThunk(
    'user/updatePassword',
    async (data: UpdatePasswordData, { rejectWithValue }) => {
        try {
            await axios.post(`${API_URL}/auth/password-update`, data, getConfig());
            return { success: true };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update password'
            );
        }
    }
);

// User slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUserError: (state) => {
            state.error = null;
        },
        clearUserSuccess: (state) => {
            state.success = false;
        },
        clearCurrentUser: (state) => {
            state.currentUser = null;
        },
    },
    extraReducers: (builder) => {
        // Get user profile
        builder.addCase(getUserProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(
            getUserProfile.fulfilled,
            (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.currentUser = action.payload;
            }
        );
        builder.addCase(getUserProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Update user profile
        builder.addCase(updateUserProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(
            updateUserProfile.fulfilled,
            (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.currentUser = action.payload;
                state.success = true;
            }
        );
        builder.addCase(updateUserProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Get user ratings
        builder.addCase(getUserRatings.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(
            getUserRatings.fulfilled,
            (state, action: PayloadAction<Rating[]>) => {
                state.loading = false;
                // Ensure userRatings is always an array
                state.userRatings = Array.isArray(action.payload) ? action.payload : [];
            }
        );
        builder.addCase(getUserRatings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Admin: Get all users
        builder.addCase(getAllUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getAllUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.users = action.payload || [];
        });
        builder.addCase(getAllUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Admin: Get user by ID
        builder.addCase(getUserById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(
            getUserById.fulfilled,
            (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.currentUser = action.payload;
            }
        );
        builder.addCase(getUserById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Admin: Create user
        builder.addCase(createUser.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(createUser.fulfilled, (state) => {
            state.loading = false;
            state.success = true;
        });
        builder.addCase(createUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Admin: Update user
        builder.addCase(updateUser.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(
            updateUser.fulfilled,
            (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.success = true;
                if (state.currentUser && state.currentUser.id === action.payload.id) {
                    state.currentUser = action.payload;
                }
                state.users = state.users.map((user) =>
                    user.id === action.payload.id ? action.payload : user
                );
            }
        );
        builder.addCase(updateUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Admin: Delete user
        builder.addCase(deleteUser.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(
            deleteUser.fulfilled,
            (state, action: PayloadAction<number>) => {
                state.loading = false;
                state.success = true;
                state.users = state.users.filter((user) => user.id !== action.payload);
            }
        );
        builder.addCase(deleteUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Update password
        builder.addCase(updatePassword.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(updatePassword.fulfilled, (state) => {
            state.loading = false;
            state.success = true;
        });
        builder.addCase(updatePassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearUserError, clearUserSuccess, clearCurrentUser } =
    userSlice.actions;
export default userSlice.reducer; 