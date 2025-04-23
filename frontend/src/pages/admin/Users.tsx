import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  TableSortLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  clearUserSuccess,
  clearUserError,
  User,
  CreateUserData,
} from '../../store/slices/userSlice';
import GridContainer from '../../components/common/GridContainer';
import GridItem from '../../components/common/GridItem';
import { SelectChangeEvent } from '@mui/material';

const initialFormData = {
  name: '',
  email: '',
  password: '',
  address: '',
  role: 'user' as 'admin' | 'user' | 'store_owner',
};

// Type for sort options
type Order = 'asc' | 'desc';
type OrderBy = 'name' | 'email' | 'address' | 'role';

const UserManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error, success } = useSelector((state: RootState) => state.user);

  // State for dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState(initialFormData);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // State for filter, pagination, and sorting
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('name');

  // State for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Load users on component mount
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Apply filtering, sorting, and pagination whenever users or search term changes
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerCaseSearch) ||
          user.email.toLowerCase().includes(lowerCaseSearch) ||
          user.address.toLowerCase().includes(lowerCaseSearch) ||
          user.role.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Apply sorting
    filtered = sortUsers(filtered, order, orderBy);

    setFilteredUsers(filtered);
  }, [users, searchTerm, order, orderBy]);

  // Handle success state
  useEffect(() => {
    if (success) {
      handleCloseDialog();
      handleCloseDeleteConfirm();
      dispatch(clearUserSuccess());
    }
  }, [success, dispatch]);

  // Sorting function
  const sortUsers = (userArray: User[], order: Order, orderBy: OrderBy) => {
    return [...userArray].sort((a, b) => {
      const valueA = a[orderBy].toLowerCase();
      const valueB = b[orderBy].toLowerCase();

      if (valueA < valueB) {
        return order === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Handle sort request
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData(initialFormData);
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user: User) => {
    setDialogMode('edit');
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't set password for edit
      address: user.address,
      role: user.role,
    });
    setSelectedUserId(user.id);
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    dispatch(clearUserError());
  };

  // Form handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });
      // Clear error when field is edited
      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: '',
        });
      }
    }
  };

  // Validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Name validation (20-60 characters)
    if (!formData.name || formData.name.length < 10 || formData.name.length > 60) {
      errors.name = 'Name must be between 10 and 60 characters';
    }

    // Email validation
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Address validation (max 400 characters)
    if (formData.address && formData.address.length > 400) {
      errors.address = 'Address must be maximum 400 characters';
    }

    // Password validation for create mode
    if (dialogMode === 'create' && (!formData.password || formData.password.length < 6 || formData.password.length > 16)) {
      errors.password = 'Password must be between 6 and 16 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = () => {
    if (validateForm()) {
      setFormErrors({});

      if (dialogMode === 'create') {
        dispatch(createUser(formData as CreateUserData));
      } else if (selectedUserId !== null) {
        const updateData = { ...formData };
        // Use optional chaining to safely access and check password
        if (updateData.password?.trim() === '') {
          // Use the spread operator to create a new object without the password property
          const { password, ...dataWithoutPassword } = updateData;
          dispatch(updateUser({ id: selectedUserId, data: dataWithoutPassword }));
        } else {
          dispatch(updateUser({ id: selectedUserId, data: updateData }));
        }
      }
    }
  };

  // Delete handling
  const handleOpenDeleteConfirm = (userId: number) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete));
    }
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page on search
  };

  // Get role display color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'store_owner':
        return 'success';
      default:
        return 'primary';
    }
  };

  // Fix the handleInputChange to handle Select's SelectChangeEvent separately
  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
            User Management
          </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add New User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            label="Search by name, email, address or role"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ mb: 2 }}
          />
        </Box>

        <TableContainer>
          <Table aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'email'}
                    direction={orderBy === 'email' ? order : 'asc'}
                    onClick={() => handleRequestSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'address'}
                    direction={orderBy === 'address' ? order : 'asc'}
                    onClick={() => handleRequestSort('address')}
                  >
                    Address
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'role'}
                    direction={orderBy === 'role' ? order : 'asc'}
                    onClick={() => handleRequestSort('role')}
                  >
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.address}</TableCell>
                    <TableCell>
                      <Chip 
                          label={user.role}
                          color={getRoleColor(user.role) as "error" | "success" | "primary"}
                        size="small"
                      />
                    </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditDialog(user)}
                          aria-label="edit user"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteConfirm(user.id)}
                          aria-label="delete user"
                        >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Create/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <GridContainer spacing={2} sx={{ mt: 1 }}>
            <GridItem xs={12} sm={6}>
            <TextField
                name="name"
                label="Name"
              fullWidth
                value={formData.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
                helperText={formErrors.name}
                required
            />
            </GridItem>
            <GridItem xs={12} sm={6}>
            <TextField
                name="email"
                label="Email"
              fullWidth
                value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
                required
            />
            </GridItem>
            <GridItem xs={12}>
            <TextField
                name="address"
                label="Address"
              fullWidth
                multiline
                rows={2}
                value={formData.address}
              onChange={handleInputChange}
                error={!!formErrors.address}
                helperText={formErrors.address}
            />
            </GridItem>
            <GridItem xs={12} sm={6}>
            <TextField
                name="password"
                label={dialogMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                type="password"
              fullWidth
                value={formData.password}
              onChange={handleInputChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                required={dialogMode === 'create'}
              />
            </GridItem>
            <GridItem xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
              <Select
                  name="role"
                  value={formData.role}
                label="Role"
                  onChange={handleSelectChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="store_owner">Store Owner</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            </GridItem>
          </GridContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;