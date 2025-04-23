import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Rating,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Comment as CommentIcon,
  Grade as GradeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store';
import {
  getStoreById,
  getStoreRatings,
  rateStore,
  clearStoreSuccess,
  clearStoreError,
  Rating as RatingType
} from '../../store/slices/storeSlice';
import { manualLogout } from '../../store/slices/authSlice';
import GridContainer from '../../components/common/GridContainer';
import GridItem from '../../components/common/GridItem';

const StoreDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentStore, storeRatings = [], loading, error, success } = useSelector(
    (state: RootState) => state.store
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Local state for rating
  const [userRating, setUserRating] = useState<number | null>(0);
  const [comment, setComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [existingRating, setExistingRating] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  // Add state for API error tracking
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch store data and ratings
  useEffect(() => {
    if (id) {
      const storeId = parseInt(id);
      if (!isNaN(storeId)) {
        const fetchData = async () => {
          try {
            await dispatch(getStoreById(storeId));
            await dispatch(getStoreRatings(storeId));
            setApiError(null);
          } catch (error) {
            setApiError(error instanceof Error ? error.message : 'Failed to fetch data');
            console.error('Error fetching store data:', error);
          }
        };

        fetchData();
      }
    }

    return () => {
      dispatch(clearStoreSuccess());
      dispatch(clearStoreError());
    };
  }, [dispatch, id]);

  // Check if user has already rated this store
  useEffect(() => {
    if (!user) return;

    // Reset states if no ratings
    if (!storeRatings || storeRatings.length === 0) {
      setExistingRating(false);
      setUserRating(0);
      setComment('');
      return;
    }

    // Find user's rating for this store
    const userExistingRating = storeRatings.find(
      rating => (rating.userId === user.id || rating.user_id === user.id)
    );

    if (userExistingRating) {
      setExistingRating(true);
      setUserRating(userExistingRating.rating);
      setComment(userExistingRating.comment || '');
    } else {
      setExistingRating(false);
      setUserRating(0);
      setComment('');
    }
  }, [storeRatings, user]);

  // Handle success state after rating submission
  useEffect(() => {
    if (success && id) {
      // Refresh data after successful rating
      const storeId = parseInt(id);
      if (!isNaN(storeId)) {
        dispatch(getStoreById(storeId));
        dispatch(getStoreRatings(storeId));
      }
      setDialogOpen(false);
      setSubmitting(false);
      dispatch(clearStoreSuccess());
    }
  }, [success, dispatch, id]);

  // Open rating dialog
  const handleRateStore = () => {
    setDialogOpen(true);
  };

  // Close rating dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    dispatch(clearStoreError());
  };

  // Submit rating
  const handleSubmitRating = () => {
    if (id && userRating) {
      const storeId = parseInt(id);
      if (!isNaN(storeId)) {
        setSubmitting(true);
        dispatch(
          rateStore({
            storeId: storeId,
            rating: userRating,
            comment: comment,
          })
        );
      }
    }
  };

  // Go back to stores list
  const handleBackToList = () => {
    navigate('/stores');
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

  // Logout handler
  const handleLogout = () => {
    dispatch(manualLogout());
    navigate('/login');
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!currentStore && !loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Store not found</Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBackToList}
          sx={{ mt: 2 }}
        >
          Back to Stores
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
          size="small"
        >
          Back to Stores
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          size="small"
        >
          Logout
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error connecting to server: {apiError}
        </Alert>
      )}

      {currentStore && (
        <>
          <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
            <Typography variant="h4" component="h1" gutterBottom>
              {currentStore.name}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <GridContainer spacing={3}>
              <GridItem xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1 }} color="primary" />
                    Location
                  </Typography>
                  <Typography variant="body1">{currentStore.address}</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1 }} color="primary" />
                    Contact
                  </Typography>
                  <Typography variant="body1">{currentStore.email}</Typography>
                </Box>
              </GridItem>

              <GridItem xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa', height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <StarIcon sx={{ mr: 1 }} color="warning" />
                    Rating Information
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1, width: 130 }}>
                      Overall Rating:
                    </Typography>
                    <Rating value={currentStore.average_rating || 0} precision={0.5} readOnly />
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      ({typeof currentStore.average_rating === 'number' ? currentStore.average_rating.toFixed(1) : "0.0"})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1, width: 130 }}>
                      Total Reviews:
                    </Typography>
                    <Chip
                      label={`${storeRatings.length} ${storeRatings.length === 1 ? 'rating' : 'ratings'}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1, width: 130 }}>
                      Your Rating:
                    </Typography>
                    {existingRating ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={userRating || 0} precision={0.5} readOnly />
                        <Typography variant="body2" color="primary" sx={{ ml: 1 }}>
                          ({userRating})
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        You haven't rated this store yet
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    color={existingRating ? "secondary" : "primary"}
                    onClick={handleRateStore}
                    sx={{ mt: 2 }}
                    startIcon={existingRating ? <EditIcon /> : <StarIcon />}
                    size="large"
                    fullWidth
                  >
                    {existingRating ? 'Update Your Rating' : 'Rate This Store'}
                  </Button>
                </Paper>
              </GridItem>
            </GridContainer>
          </Paper>

          {/* Recent ratings list */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box display="flex" alignItems="center">
              <CommentIcon sx={{ mr: 1 }} color="primary" />
              <Typography variant="h5">
                Recent Ratings & Reviews
              </Typography>
            </Box>
            {storeRatings.length > 0 && (
              <Chip
                label={`${storeRatings.length} ${storeRatings.length === 1 ? 'review' : 'reviews'}`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          {storeRatings.length === 0 ? (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
              elevation={2}
            >
              <Typography variant="h6" color="text.secondary">
                No ratings yet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Be the first to rate this store!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRateStore}
                sx={{ mt: 1 }}
                startIcon={<StarIcon />}
              >
                Add Your Rating
              </Button>
            </Paper>
          ) : (
            <GridContainer spacing={2}>
              {storeRatings.map((rating) => (
                <GridItem key={rating.id} xs={12} md={6}>
                  <Card sx={{ mb: 2, borderRadius: 2 }} elevation={2}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            {(rating.user?.name || rating.user_name || 'A').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {rating.user?.name || rating.user_name || 'Anonymous User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(rating.createdAt || rating.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <Rating value={rating.rating} readOnly size="small" />
                          <Typography variant="subtitle2" color="primary.main" fontWeight="bold">
                            {rating.rating.toFixed(1)}
                          </Typography>
                        </Box>
                      </Box>

                      {rating.comment && (
                        <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                          <Typography variant="body2">
                            {rating.comment}
                          </Typography>
                        </Paper>
                      )}
                    </CardContent>
                  </Card>
                </GridItem>
              ))}
            </GridContainer>
          )}

          {/* Rating dialog */}
          <Dialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
              {existingRating ? 'Update Your Rating' : 'Rate This Store'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {currentStore.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {currentStore.address}
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Your Rating:
                  </Typography>
                  <Rating
                    value={userRating}
                    onChange={(_, newValue) => setUserRating(newValue)}
                    precision={1}
                    size="large"
                    sx={{ fontSize: '2.5rem', my: 1 }}
                  />
                  {userRating && (
                    <Typography variant="h6" color="primary">
                      {userRating.toFixed(1)}
                    </Typography>
                  )}
                </Box>

                <TextField
                  label="Share your experience (optional)"
                  multiline
                  rows={4}
                  fullWidth
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="Share your experience with this store..."
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseDialog} variant="outlined">Cancel</Button>
              <Button
                onClick={handleSubmitRating}
                color="primary"
                variant="contained"
                disabled={!userRating || submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : <StarIcon />}
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default StoreDetails; 