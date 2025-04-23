import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

// Types
export interface Store {
    id: number;
    name: string;
    email: string;
    address: string;
    average_rating: number;
    userRating?: number | null;
    userComment?: string | null;
    owner_id?: number;
}

export interface Rating {
    id: number;
    storeId?: number;
    userId?: number;
    store_id?: number;
    user_id?: number;
    rating: number;
    comment?: string;
    user?: {
        name: string;
        email: string;
    };
    user_name?: string;
    createdAt?: string;
    created_at?: string;
}

interface StoreState {
    stores: Store[];
    currentStore: Store | null;
    storeRatings: Rating[];
    loading: boolean;
    error: string | null;
    success: boolean;
}

// Initial state
const initialState: StoreState = {
    stores: [],
    currentStore: null,
    storeRatings: [],
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

// Async Thunks
export const getAllStores = createAsyncThunk(
    'store/getAllStores',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/stores`);
            console.log('getAllStores response:', response.data);
            
            // Ensure average_rating is properly formatted
            const stores = response.data.data.map((store: any) => ({
                ...store,
                // Parse average_rating to ensure it's a number and not null or undefined
                average_rating: store.average_rating !== null && store.average_rating !== undefined 
                    ? parseFloat(store.average_rating) 
                    : 0
            }));
            
            return stores;
        } catch (error: any) {
            console.error('getAllStores error:', error);
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch stores'
            );
        }
    }
);

export const getStoreById = createAsyncThunk(
    'store/getStoreById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/stores/${id}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch store'
            );
        }
    }
);

export const getStoreRatings = createAsyncThunk(
    'store/getStoreRatings',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/stores/${id}/ratings`);
            return response.data.data || [];
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch ratings'
            );
        }
    }
);

export interface RatingData {
    storeId: number;
    rating: number;
    comment?: string;
}

export const rateStore = createAsyncThunk(
    'store/rateStore',
    async (data: RatingData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_URL}/stores/${data.storeId}/ratings`,
                { rating: data.rating, comment: data.comment },
                getConfig()
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to submit rating'
            );
        }
    }
);

// Create store thunk (for store owners and admins)
export interface CreateStoreData {
    name: string;
    email: string;
    address: string;
    owner_id?: number;
}

export const createStore = createAsyncThunk(
    'store/createStore',
    async (data: CreateStoreData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_URL}/stores`,
                data,
                getConfig()
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create store'
            );
        }
    }
);

export const updateStore = createAsyncThunk(
    'store/updateStore',
    async (
        { id, data }: { id: number; data: Partial<CreateStoreData> },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.put(
                `${API_URL}/stores/${id}`,
                data,
                getConfig()
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update store'
            );
        }
    }
);

// Admin specific thunks
export const getAllStoresAdmin = createAsyncThunk(
    'store/getAllStoresAdmin',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/admin/stores`, getConfig());
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch stores'
            );
        }
    }
);

export const deleteStore = createAsyncThunk(
    'store/deleteStore',
    async (id: number, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/admin/stores/${id}`, getConfig());
            return id;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete store'
            );
        }
    }
);

// Store slice
const storeSlice = createSlice({
    name: 'store',
    initialState,
    reducers: {
        clearStoreError: (state) => {
            state.error = null;
        },
        clearStoreSuccess: (state) => {
            state.success = false;
        },
        clearCurrentStore: (state) => {
            state.currentStore = null;
        },
    },
    extraReducers: (builder) => {
        // Get all stores
        builder.addCase(getAllStores.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(
            getAllStores.fulfilled,
            (state, action: PayloadAction<Store[]>) => {
                state.loading = false;
                state.stores = action.payload;
            }
        );
        builder.addCase(getAllStores.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Get store by ID
        builder.addCase(getStoreById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(
            getStoreById.fulfilled,
            (state, action: PayloadAction<Store>) => {
                state.loading = false;
                state.currentStore = action.payload;
            }
        );
        builder.addCase(getStoreById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Get store ratings
        builder.addCase(getStoreRatings.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(
            getStoreRatings.fulfilled,
            (state, action: PayloadAction<Rating[]>) => {
                state.loading = false;
                state.storeRatings = action.payload;
            }
        );
        builder.addCase(getStoreRatings.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Rate store
        builder.addCase(rateStore.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(rateStore.fulfilled, (state) => {
            state.loading = false;
            state.success = true;
        });
        builder.addCase(rateStore.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Create store
        builder.addCase(createStore.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(createStore.fulfilled, (state) => {
            state.loading = false;
            state.success = true;
        });
        builder.addCase(createStore.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Update store
        builder.addCase(updateStore.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(updateStore.fulfilled, (state, action: PayloadAction<Store>) => {
            state.loading = false;
            state.success = true;
            if (state.currentStore && state.currentStore.id === action.payload.id) {
                state.currentStore = action.payload;
            }
            state.stores = state.stores.map(store =>
                store.id === action.payload.id ? action.payload : store
            );
        });
        builder.addCase(updateStore.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Admin: Get all stores
        builder.addCase(getAllStoresAdmin.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(
            getAllStoresAdmin.fulfilled,
            (state, action: PayloadAction<Store[]>) => {
                state.loading = false;
                state.stores = action.payload;
            }
        );
        builder.addCase(getAllStoresAdmin.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Admin: Delete store
        builder.addCase(deleteStore.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(deleteStore.fulfilled, (state, action: PayloadAction<number>) => {
            state.loading = false;
            state.success = true;
            state.stores = state.stores.filter(store => store.id !== action.payload);
        });
        builder.addCase(deleteStore.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearStoreError, clearStoreSuccess, clearCurrentStore } = storeSlice.actions;
export default storeSlice.reducer; 