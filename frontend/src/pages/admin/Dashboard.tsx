import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Store as StoreIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store';
import { getDashboardStats } from '../../store/slices/adminSlice';
import GridContainer from '../../components/common/GridContainer';
import GridItem from '../../components/common/GridItem';

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboardStats, loading, error } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Default values if dashboardStats is null
  const totalUsers = dashboardStats?.totalUsers || 0;
  const totalStores = dashboardStats?.totalStores || 0;
  const totalRatings = dashboardStats?.totalRatings || 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <GridContainer spacing={3}>
        {/* Total Users Card */}
        <GridItem xs={12} md={4}>
          <Card raised>
            <CardHeader
              title="Total Users"
              titleTypographyProps={{ align: 'center' }}
              sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                color: 'white',
              }}
            />
            <Divider />
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <PeopleIcon sx={{ height: 40, width: 40, mr: 1, color: 'primary.main' }} />
                <Typography variant="h3" component="div">
                  {totalUsers}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                Registered users on the platform
              </Typography>
            </CardContent>
          </Card>
        </GridItem>

        {/* Total Stores Card */}
        <GridItem xs={12} md={4}>
          <Card raised>
            <CardHeader
              title="Total Stores"
              titleTypographyProps={{ align: 'center' }}
              sx={{
                backgroundColor: (theme) => theme.palette.secondary.main,
                color: 'white',
              }}
            />
            <Divider />
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <StoreIcon sx={{ height: 40, width: 40, mr: 1, color: 'secondary.main' }} />
                <Typography variant="h3" component="div">
                  {totalStores}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                Stores registered on the platform
              </Typography>
            </CardContent>
          </Card>
        </GridItem>

        {/* Total Ratings Card */}
        <GridItem xs={12} md={4}>
          <Card raised>
            <CardHeader
              title="Total Ratings"
              titleTypographyProps={{ align: 'center' }}
              sx={{
                backgroundColor: (theme) => theme.palette.warning.main,
                color: 'white',
              }}
            />
            <Divider />
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <StarIcon sx={{ height: 40, width: 40, mr: 1, color: 'warning.main' }} />
                <Typography variant="h3" component="div">
                  {totalRatings}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                Ratings submitted by users
              </Typography>
            </CardContent>
          </Card>
        </GridItem>

        {/* Recent Activity Section */}
        <GridItem xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom component="h2">
              Welcome to the Admin Dashboard
            </Typography>
            <Typography variant="body1" paragraph>
              As an administrator, you have full access to manage users, stores, and monitor ratings on the platform.
            </Typography>
            <Typography variant="body1" paragraph>
              Use the navigation menu to access different sections of the admin interface:
            </Typography>
            <ul>
              <li>
                <Typography variant="body1">
                  <strong>Users:</strong> View, add, edit, and delete users
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Stores:</strong> Manage store listings and view ratings
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>Dashboard:</strong> Monitor key metrics and system performance
                </Typography>
              </li>
            </ul>
          </Paper>
        </GridItem>
      </GridContainer>
    </Container>
  );
};

export default AdminDashboard; 