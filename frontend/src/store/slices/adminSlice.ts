import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

// Types
interface DashboardStats {
    totalUsers: number;
    totalStores: number;
    totalRatings: number;
}

interface AdminState {
    dashboardStats: DashboardStats | null;
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: AdminState = {
    dashboardStats: null,
    loading: false,
    error: null,
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

// Async Thunks
export const getDashboardStats = createAsyncThunk(
    'admin/getDashboardStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API_URL}/admin/dashboard-stats`,
                getConfig()
            );
            return response.data.stats;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch dashboard statistics'
            );
        }
    }
);

// Admin slice
const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Get dashboard stats
        builder.addCase(getDashboardStats.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(
            getDashboardStats.fulfilled,
            (state, action: PayloadAction<DashboardStats>) => {
                state.loading = false;
                state.dashboardStats = action.payload;
            }
        );
        builder.addCase(getDashboardStats.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer; 