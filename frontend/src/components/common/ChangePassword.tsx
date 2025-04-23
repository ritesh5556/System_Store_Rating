import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Alert,
    CircularProgress,
} from '@mui/material';
import { AppDispatch, RootState } from '../../store';
import { updatePassword, clearUserSuccess, clearUserError } from '../../store/slices/userSlice';

const ChangePassword: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, success } = useSelector((state: RootState) => state.user);

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [formErrors, setFormErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Reset form after successful password change
    useEffect(() => {
        if (success) {
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            // Clear success state after 3 seconds
            const timer = setTimeout(() => {
                dispatch(clearUserSuccess());
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [success, dispatch]);

    const validateForm = (): boolean => {
        let valid = true;
        const errors = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        };

        // Current password validation
        if (!formData.currentPassword) {
            errors.currentPassword = 'Current password is required';
            valid = false;
        }

        // New password validation (8-16 chars, includes uppercase and special char)
        if (!formData.newPassword) {
            errors.newPassword = 'New password is required';
            valid = false;
        } else if (formData.newPassword.length < 8 || formData.newPassword.length > 16) {
            errors.newPassword = 'Password must be between 8 and 16 characters';
            valid = false;
        } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
            errors.newPassword = 'Password must include at least one uppercase letter';
            valid = false;
        } else if (!/(?=.*[!@#$%^&*])/.test(formData.newPassword)) {
            errors.newPassword = 'Password must include at least one special character';
            valid = false;
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
            valid = false;
        } else if (formData.newPassword !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
            valid = false;
        }

        setFormErrors(errors);
        return valid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear error when field is edited
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors({
                ...formErrors,
                [name]: '',
            });
        }

        // Clear any API errors when typing
        if (error) {
            dispatch(clearUserError());
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validateForm()) {
            // Send only the required fields to the API
            dispatch(
                updatePassword({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                })
            );
        }
    };

    return (
        <Paper sx={{ p: 3, width: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Change Password
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Password updated successfully!
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="currentPassword"
                    label="Current Password"
                    type="password"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    error={!!formErrors.currentPassword}
                    helperText={formErrors.currentPassword}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="newPassword"
                    label="New Password"
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    error={!!formErrors.newPassword}
                    helperText={formErrors.newPassword || "8-16 characters, including at least one uppercase letter and one special character"}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!formErrors.confirmPassword}
                    helperText={formErrors.confirmPassword}
                />
                <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3 }}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Update Password'}
                </Button>
            </Box>
        </Paper>
    );
};

export default ChangePassword; 