import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Button
} from '@mui/material';
import {
  RateReview,
  Storefront,
  StarRate
} from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config/api';
import GridContainer from '../../components/common/GridContainer';
import GridItem from '../../components/common/GridItem';

interface DashboardStats {
  totalRatings: number;
  ratedStores: number;
  averageRating: number;
}

const UserDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Try to use the user-specific endpoint first
        try {
          const response = await axios.get(`${API_URL}/users/dashboard-stats`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setStats(response.data.stats);
          setError(null);
        } catch (userError) {
          // If the user endpoint fails, fallback to the admin endpoint
          console.warn('User dashboard endpoint failed, falling back to admin endpoint');
          const adminResponse = await axios.get(`${API_URL}/admin/dashboard-stats`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setStats(adminResponse.data.stats);
          setError(null);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      <Typography variant="h4" gutterBottom>
        User Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Welcome to your store rating dashboard
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <GridContainer spacing={3}>
        <GridItem xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Your Total Ratings
                  </Typography>
                  <Typography variant="h4">
                    {stats?.totalRatings || 0}
                  </Typography>
                </Box>
                <RateReview color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Stores Rated
                  </Typography>
                  <Typography variant="h4">
                    {stats?.ratedStores || 0}
                  </Typography>
                </Box>
                <Storefront color="secondary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Your Average Rating
                  </Typography>
                  <Typography variant="h4">
                    {stats?.averageRating !== undefined ? parseFloat(stats.averageRating.toString()).toFixed(1) : '0.0'}
                  </Typography>
                </Box>
                <StarRate color="warning" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </GridItem>
      </GridContainer>

      <Box mt={4}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/stores"
            >
              Browse Stores
            </Button>
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              to="/profile"
            >
              View Profile
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default UserDashboard; 