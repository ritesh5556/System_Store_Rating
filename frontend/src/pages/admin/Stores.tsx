import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Snackbar,
  Alert,
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  owner_id: number;
  owner_name?: string;
  owner_email?: string;
  average_rating?: number;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const AdminStores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeOwners, setStoreOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: 0
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Fetch stores
        const storesResponse = await axios.get(`${API_URL}/admin/stores`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Fetch users to get store owners
        const usersResponse = await axios.get(`${API_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Filter users to get only store owners
        const owners = usersResponse.data.data.filter(
          (user: User) => user.role === 'store_owner'
        );

        setStores(storesResponse.data.data);
        setStoreOwners(owners);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form
    setNewStore({
      name: '',
      email: '',
      address: '',
      owner_id: 0
    });
    setFormErrors({
      name: '',
      email: '',
      address: '',
      owner_id: ''
    });
  };

  const validateForm = () => {
    let valid = true;
    const errors = {
      name: '',
      email: '',
      address: '',
      owner_id: ''
    };

    if (!newStore.name.trim()) {
      errors.name = 'Store name is required';
      valid = false;
    }

    if (!newStore.email.trim()) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(newStore.email)) {
      errors.email = 'Email is invalid';
      valid = false;
    }

    if (!newStore.address.trim()) {
      errors.address = 'Address is required';
      valid = false;
    } else if (newStore.address.length > 400) {
      errors.address = 'Address must be less than 400 characters';
      valid = false;
    }

    if (!newStore.owner_id) {
      errors.owner_id = 'Store owner is required';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleCreateStore = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/admin/stores`,
        newStore,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Find the owner details
      const owner = storeOwners.find(owner => owner.id === newStore.owner_id);

      // Add the new store to the list with owner details
      const createdStore = response.data.data;
      const storeWithOwner = {
        ...createdStore,
        owner_name: owner?.name,
        owner_email: owner?.email,
        average_rating: 0
      };

      setStores([storeWithOwner, ...stores]);

      setSnackbar({
        open: true,
        message: 'Store created successfully',
        severity: 'success'
      });

      handleClose();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to create store',
        severity: 'error'
      });
    }
  };

  const handleDeleteStore = async (storeId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/stores/${storeId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Remove the deleted store from the list
      setStores(stores.filter(store => store.id !== storeId));

      setSnackbar({
        open: true,
        message: 'Store deleted successfully',
        severity: 'success'
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete store',
        severity: 'error'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStore({
      ...newStore,
      [name]: value
    });
  };

  const handleOwnerChange = (event: SelectChangeEvent<string>) => {
    setNewStore({
      ...newStore,
      owner_id: parseInt(event.target.value as string, 10)
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            Store Management
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            View and manage all stores in the system
          </Typography>
        </div>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Add New Store
        </Button>
      </Box>

      <Paper elevation={3} sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Store Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Owner Name</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stores
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>{store.name}</TableCell>
                    <TableCell>{store.email}</TableCell>
                    <TableCell>{store.address}</TableCell>
                    <TableCell>{store.owner_name}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Rating
                          value={Number(store.average_rating) || 0}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({Number(store.average_rating) ? Number(store.average_rating).toFixed(1) : '0.0'})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteStore(store.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {stores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No stores found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={stores.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Create Store Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Store</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Store Name"
              name="name"
              value={newStore.name}
              onChange={handleInputChange}
              margin="normal"
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={newStore.email}
              onChange={handleInputChange}
              margin="normal"
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              multiline
              rows={3}
              value={newStore.address}
              onChange={handleInputChange}
              margin="normal"
              error={!!formErrors.address}
              helperText={formErrors.address}
            />
            <FormControl fullWidth margin="normal" error={!!formErrors.owner_id}>
              <InputLabel id="owner-select-label">Store Owner</InputLabel>
              <Select
                labelId="owner-select-label"
                id="owner-select"
                value={newStore.owner_id ? newStore.owner_id.toString() : ''}
                label="Store Owner"
                onChange={handleOwnerChange}
              >
                <MenuItem value="" disabled>
                  Select Store Owner
                </MenuItem>
                {storeOwners.map((owner) => (
                  <MenuItem key={owner.id} value={owner.id.toString()}>
                    {owner.name} ({owner.email})
                  </MenuItem>
                ))}
              </Select>
              {formErrors.owner_id && (
                <Typography variant="caption" color="error">
                  {formErrors.owner_id}
                </Typography>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateStore} color="primary" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminStores; 