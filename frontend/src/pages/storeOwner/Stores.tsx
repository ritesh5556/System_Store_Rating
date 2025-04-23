import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid as MuiGrid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add,
  Store as StoreIcon,
  Edit,
  Delete,
  Star,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import GridContainer from '../../components/common/GridContainer';
import GridItem from '../../components/common/GridItem';
import { API_URL } from '../../config/api';

interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  average_rating: number;
  ratingCount?: number;
  created_at?: string;
  owner_id?: number;
}

interface StoreFormData {
  name: string;
  description: string;
}

const StoreOwnerStores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    description: ''
  });
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/stores`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStores(response.data.data.filter((store: Store) => store.owner_id === user?.id));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [user]);

  const handleOpenDialog = (store?: Store) => {
    if (store) {
      // Edit mode
      setFormData({
        name: store.name,
        description: store.address
      });
      setEditingStoreId(store.id.toString());
    } else {
      // Create mode
      setFormData({
        name: '',
        description: ''
      });
      setEditingStoreId(null);
    }
    setSubmitError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmitError(null);

      const token = localStorage.getItem('token');

      if (editingStoreId) {
        // Update store
        await axios.put(
          `${API_URL}/stores/${editingStoreId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        // Create store
        await axios.post(
          `${API_URL}/stores`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      // Refresh stores
      fetchStores();
      setDialogOpen(false);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to save store');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (store: Store) => {
    setStoreToDelete(store);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setStoreToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!storeToDelete) return;

    try {
      setDeleting(true);
      setDeleteError(null);

      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/stores/${storeToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh stores
      fetchStores();
      setDeleteDialogOpen(false);
      setStoreToDelete(null);
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete store');
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = () => {
    fetchStores();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Try Again
            </Button>
          }
        >
          Error: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          My Stores
        </Typography>
        <Box>
          <Tooltip title="Refresh stores">
            <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Store
          </Button>
        </Box>
      </Box>

      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Manage your stores and see their performance
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {stores.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <StoreIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            You don't have any stores yet
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Create a store to start receiving ratings from users
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Store
          </Button>
        </Paper>
      ) : (
        <GridContainer spacing={3}>
          {stores.map(store => (
            <GridItem key={store.id} xs={12} sm={6} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Typography variant="h6" gutterBottom>
                      {store.name}
                    </Typography>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(store)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(store)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="textSecondary" paragraph>
                    {store.address || 'No description provided.'}
                  </Typography>

                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      Rating:
                    </Typography>
                    <Rating value={store.average_rating || 0} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({typeof store.average_rating === 'number' ? store.average_rating.toFixed(1) : "0.0"})
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <Typography variant="caption" display="block" color="text.secondary">
                      {store.ratingCount || 0} {(store.ratingCount || 0) === 1 ? 'rating' : 'ratings'}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Typography variant="caption" color="textSecondary">
                    Created: {new Date(store.created_at || '').toLocaleDateString()}
                  </Typography>
                </CardActions>
              </Card>
            </GridItem>
          ))}
        </GridContainer>
      )}

      {/* Create/Edit Store Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStoreId ? 'Edit Store' : 'Create New Store'}
        </DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          <Box my={2}>
            <TextField
              label="Store Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              required
              margin="normal"
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              margin="normal"
              placeholder="Describe your store..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={submitting || !formData.name.trim()}
          >
            {submitting ? <CircularProgress size={24} /> : (editingStoreId ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <Typography variant="body1">
            Are you sure you want to delete "{storeToDelete?.name}"?
          </Typography>
          <Typography variant="body2" color="error" mt={1}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreOwnerStores; 