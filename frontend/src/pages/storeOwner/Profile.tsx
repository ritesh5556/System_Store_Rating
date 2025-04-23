import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Avatar,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Alert,
  Grid
} from '@mui/material';
import { Person, Store as StoreIcon, Lock } from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import GridContainer from '../../components/common/GridContainer';
import GridItem from '../../components/common/GridItem';
import { API_URL } from '../../config/api';

interface ProfileData {
  name: string;
  email: string;
  storeCount: number;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const StoreOwnerProfile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    storeCount: 0
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/stores/owner/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setProfile({
          name: response.data.data.name,
          email: response.data.data.email,
          storeCount: response.data.data.storeCount || 0
        });

        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile data');
        // Set basic profile from Redux state if API fails
        if (user) {
          setProfile({
            name: user.name || '',
            email: user.email || '',
            storeCount: 0
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/stores/owner/profile`,
        { name: profile.name },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      setUpdatingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/auth/password-update`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setPasswordSuccess('Password updated successfully!');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Your Profile
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Manage your store owner account
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <GridContainer spacing={4}>
        {/* Profile Information */}
        <GridItem xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  mb: 2
                }}
              >
                <Person sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h6">{profile.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {profile.email}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <StoreIcon fontSize="small" sx={{ mr: 0.5 }} color="primary" />
                <Typography variant="body2" color="primary">
                  {profile.storeCount} {profile.storeCount === 1 ? 'Store' : 'Stores'}
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              Update Profile Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <form onSubmit={handleSubmit}>
              <GridContainer spacing={2}>
                <GridItem xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    variant="outlined"
                    required
                  />
                </GridItem>
                <GridItem xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profile.email}
                    variant="outlined"
                    disabled
                    helperText="Email cannot be changed"
                  />
                </GridItem>
                <GridItem xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={updating}
                    sx={{ mt: 2 }}
                  >
                    {updating ? <CircularProgress size={24} /> : 'Update Profile'}
                  </Button>
                </GridItem>
              </GridContainer>
            </form>
          </Paper>
        </GridItem>

        {/* Password Update */}
        <GridItem xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'secondary.main',
                  mb: 2
                }}
              >
                <Lock sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h6">Security</Typography>
              <Typography variant="body2" color="textSecondary">
                Update your password
              </Typography>
            </Box>

            {passwordError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {passwordError}
              </Alert>
            )}

            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {passwordSuccess}
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <form onSubmit={handlePasswordSubmit}>
              <GridContainer spacing={2}>
                <GridItem xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    variant="outlined"
                    required
                  />
                </GridItem>
                <GridItem xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    variant="outlined"
                    required
                  />
                </GridItem>
                <GridItem xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    variant="outlined"
                    required
                  />
                </GridItem>
                <GridItem xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    fullWidth
                    disabled={updatingPassword}
                    sx={{ mt: 2 }}
                  >
                    {updatingPassword ? <CircularProgress size={24} /> : 'Update Password'}
                  </Button>
                </GridItem>
              </GridContainer>
            </form>
          </Paper>
        </GridItem>
      </GridContainer>
    </Box>
  );
};

export default StoreOwnerProfile; 