import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Rating,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Store as StoreIcon,
  StarRate as StarIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store';
import { getAllStores, getStoreRatings, Store, Rating as RatingType } from '../../store/slices/storeSlice';
import GridContainer from '../../components/common/GridContainer';
import GridItem from '../../components/common/GridItem';

const StoreOwnerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stores, storeRatings = [], loading, error } = useSelector((state: RootState) => state.store);

  // Get store owner's stores
  const [ownerStores, setOwnerStores] = useState<Store[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  // Fetch stores on component mount
  useEffect(() => {
    dispatch(getAllStores());
  }, [dispatch]);

  // Filter stores based on owner ID when stores are loaded
  useEffect(() => {
    if (user && stores && stores.length > 0) {
      const filteredStores = stores.filter(store => store.owner_id === user.id);
      setOwnerStores(filteredStores);

      // Fetch ratings for the first store if available
      if (filteredStores.length > 0) {
        setLoadingRatings(true);
        dispatch(getStoreRatings(filteredStores[0].id))
          .finally(() => setLoadingRatings(false));
      }
    }
  }, [stores, user, dispatch]);

  // Navigate to stores page
  const handleViewStores = () => {
    navigate('/store-owner/stores');
  };

  // Safe method to format the date
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'Unknown date';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Calculate average rating
  const averageRating = ownerStores.length > 0
    ? ownerStores.reduce((sum, store) => {
      const rating = typeof store.average_rating === 'number' ? store.average_rating : 0;
      return sum + rating;
    }, 0) / ownerStores.length
    : 0;

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Store Owner Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewStores}
        >
          View My Stores
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!ownerStores || ownerStores.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            You don't have any stores yet.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Contact an administrator to add a store for your account.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={handleViewStores}
          >
            Go to Stores Page
          </Button>
        </Paper>
      ) : (
        <GridContainer spacing={3}>
          {/* Store Stats */}
          <GridItem xs={12} md={4}>
            <Card raised>
              <CardContent sx={{ textAlign: 'center' }}>
                <StoreIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Your Stores
                </Typography>
                <Typography variant="h3">
                  {ownerStores.length}
                </Typography>
              </CardContent>
            </Card>
          </GridItem>

          {/* Average Rating */}
          <GridItem xs={12} md={4}>
            <Card raised>
              <CardContent sx={{ textAlign: 'center' }}>
                <StarIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Average Rating
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="h3" sx={{ mr: 1 }}>
                    {typeof averageRating === 'number' ? averageRating.toFixed(1) : "0.0"}
                  </Typography>
                  <Rating value={averageRating} precision={0.5} readOnly />
                </Box>
              </CardContent>
            </Card>
          </GridItem>

          {/* Total Reviews */}
          <GridItem xs={12} md={4}>
            <Card raised>
              <CardContent sx={{ textAlign: 'center' }}>
                <PersonIcon color="secondary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Total Reviews
                </Typography>
                <Typography variant="h3">
                  {storeRatings && storeRatings.length ? storeRatings.length : 0}
                </Typography>
              </CardContent>
            </Card>
          </GridItem>

          {/* Store Details */}
          <GridItem xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Your Stores
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {ownerStores.map((store) => (
                <Card key={store.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">
                      {store.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {store.email}
                    </Typography>
                    <Typography variant="body2">
                      {store.address}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Rating:
                      </Typography>
                      <Rating value={store.average_rating || 0} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({typeof store.average_rating === 'number' ? store.average_rating.toFixed(1) : "0.0"})
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          </GridItem>

          {/* Recent Ratings */}
          <GridItem xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Recent Ratings
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {loadingRatings ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={30} />
                </Box>
              ) : !storeRatings || storeRatings.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  No ratings yet.
                </Typography>
              ) : (
                <List>
                  {storeRatings.slice(0, 5).map((rating) => (
                    <ListItem key={rating.id} alignItems="flex-start" divider>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1">
                              {rating.user_name || rating.user?.name || 'Anonymous User'}
                            </Typography>
                            <Rating value={rating.rating} readOnly size="small" />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.primary"
                            >
                              {formatDate(rating.created_at || rating.createdAt)}
                            </Typography>
                            {rating.comment && (
                              <Typography
                                component="p"
                                variant="body2"
                                sx={{ mt: 0.5 }}
                              >
                                {rating.comment}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </GridItem>
        </GridContainer>
      )}
    </Container>
  );
};

export default StoreOwnerDashboard; 