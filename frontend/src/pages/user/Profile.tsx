import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AppDispatch, RootState } from '../../store';
import {
  getUserProfile,
  updateUserProfile,
  clearUserSuccess,
  clearUserError,
} from '../../store/slices/userSlice';
import ChangePassword from '../../components/common/ChangePassword';
import GridContainer from '../../components/common/GridContainer';
import GridItem from '../../components/common/GridItem';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentUser, loading, error, success } = useSelector(
    (state: RootState) => state.user
  );

  // Profile form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    address: '',
  });

  // Load user profile data
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  // Update form data when user profile is loaded
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
      });
    }
  }, [currentUser]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearUserSuccess());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Validate form
  const validateForm = (): boolean => {
    let valid = true;
    const errors = {
      name: '',
      email: '',
      address: '',
    };

    // Name validation (min 10 chars, max 60 chars)
    if (formData.name && (formData.name.length < 10 || formData.name.length > 60)) {
      errors.name = 'Name must be between 10 and 60 characters';
      valid = false;
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      valid = false;
    }

    // Address validation (max 400 chars)
    if (formData.address && formData.address.length > 400) {
      errors.address = 'Address must be at most 400 characters';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear specific field error when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }

    // Clear API errors when typing
    if (error) {
      dispatch(clearUserError());
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      // Only send fields that have changed
      const updateData: { [key: string]: string } = {};

      if (currentUser) {
        if (formData.name !== currentUser.name) updateData.name = formData.name;
        if (formData.email !== currentUser.email) updateData.email = formData.email;
        if (formData.address !== currentUser.address) updateData.address = formData.address;
      }

      // Only dispatch if there are changes
      if (Object.keys(updateData).length > 0) {
        dispatch(updateUserProfile(updateData));
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      <GridContainer spacing={3}>
        <GridItem xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Profile updated successfully!
              </Alert>
            )}

            {loading && !currentUser ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="address"
                  label="Address"
                  name="address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Role: {user?.role}
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 3 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                </Button>
              </Box>
            )}
          </Paper>
        </GridItem>

        <GridItem xs={12} md={6}>
          <ChangePassword />
        </GridItem>
      </GridContainer>
    </Container>
  );
};

export default Profile; 