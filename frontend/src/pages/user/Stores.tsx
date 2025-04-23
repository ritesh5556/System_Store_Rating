import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Container,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  Rating,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
  Grid,
  Divider
} from '@mui/material';
import {
  Star as StarIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Grade as GradeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store';
import { getAllStores, Store, rateStore } from '../../store/slices/storeSlice';
import { getUserRatings } from '../../store/slices/userSlice';
import { manualLogout } from '../../store/slices/authSlice';
import GridContainer from '../../components/common/GridContainer';
import GridItem from '../../components/common/GridItem';

// Type for sort options
type Order = 'asc' | 'desc';
type OrderBy = 'name' | 'address' | 'average_rating';

const Stores: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { stores, loading, error, success } = useSelector((state: RootState) => state.store);
  const { userRatings } = useSelector((state: RootState) => state.user);
  const { user } = useSelector((state: RootState) => state.auth);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);

  // Sorting state
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('name');

  // Rating dialog state
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [currentStoreForRating, setCurrentStoreForRating] = useState<Store | null>(null);
  const [userRatingValue, setUserRatingValue] = useState<number | null>(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // Add error state for debugging API issues
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching stores and ratings...");
        await dispatch(getAllStores());
        await dispatch(getUserRatings());
        console.log("Data fetching completed successfully");
        setApiError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setApiError(error instanceof Error ? error.message : 'Failed to fetch data');
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (stores.length > 0) {
      console.log("User Ratings Data:", userRatings);
      console.log("Stores Data:", stores);
      
      // Apply user ratings to stores
      const storesWithUserRatings = stores.map(store => {
        // Ensure average_rating is properly formatted
        const formattedStore = {
          ...store,
          average_rating: typeof store.average_rating === 'string' 
            ? parseFloat(store.average_rating) 
            : (store.average_rating || 0)
        };
        
        // Make sure userRatings exists before using find
        const userRating = userRatings && Array.isArray(userRatings) 
          ? userRatings.find(rating => rating && rating.store_id === store.id)
          : null;
        
        console.log(`Processing store ${store.name} (ID: ${store.id}):`, {
          foundRating: userRating ? userRating : "No rating found",
          average_rating: formattedStore.average_rating
        });

        return {
          ...formattedStore,
          userRating: userRating ? userRating.rating : null,
          userComment: userRating ? userRating.comment : null
        };
      });

      // Filter stores based on search term
      const filtered = storesWithUserRatings.filter(store =>
        searchTerm === '' ||
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Sort the stores
      const sortedStores = sortStores(filtered, order, orderBy);
      setFilteredStores(sortedStores);
    }
  }, [stores, userRatings, searchTerm, order, orderBy]);

  // Handle rating success
  useEffect(() => {
    if (success) {
      console.log("Rating submitted successfully, refreshing data");
      // Refresh the data
      try {
        dispatch(getAllStores());
        dispatch(getUserRatings())
          .then(() => {
            console.log("Data refreshed after rating submission");
            setRatingDialogOpen(false);
            setRatingSubmitting(false);
          })
          .catch((error) => {
            console.error("Error refreshing data after rating submission:", error);
            setRatingDialogOpen(false);
            setRatingSubmitting(false);
          });
      } catch (error) {
        console.error("Exception refreshing data after rating:", error);
        setRatingDialogOpen(false);
        setRatingSubmitting(false);
      }
    }
  }, [success, dispatch]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle sorting
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Create a stable sort function
  const sortStores = (storeArray: Store[], order: Order, orderBy: OrderBy) => {
    return [...storeArray].sort((a, b) => {
      const valueA = a[orderBy];
      const valueB = b[orderBy];

      if (valueA < valueB) {
        return order === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Navigate to store details page
  const handleViewDetails = (storeId: number) => {
    navigate(`/stores/${storeId}`);
  };

  // Open rating dialog
  const handleOpenRatingDialog = (store: Store) => {
    console.log("Opening rating dialog for store:", store);
    setCurrentStoreForRating(store);
    // Safely handle null/undefined ratings
    const safeRating = store.userRating !== undefined && store.userRating !== null 
      ? store.userRating 
      : 0;
    setUserRatingValue(safeRating);
    // Safely handle null/undefined comments
    const safeComment = store.userComment !== undefined && store.userComment !== null 
      ? store.userComment 
      : '';
    setRatingComment(safeComment);
    setRatingDialogOpen(true);
  };

  // Close rating dialog
  const handleCloseRatingDialog = () => {
    setRatingDialogOpen(false);
    setCurrentStoreForRating(null);
    setUserRatingValue(0);
    setRatingComment('');
  };

  // Submit rating
  const handleSubmitRating = () => {
    if (!currentStoreForRating) {
      console.error("Cannot submit rating: No store selected");
      return;
    }
    
    if (userRatingValue === null || userRatingValue < 1 || userRatingValue > 5) {
      console.error("Cannot submit rating: Invalid rating value", userRatingValue);
      return;
    }
    
    try {
      console.log("Submitting rating:", {
        storeId: currentStoreForRating.id,
        rating: userRatingValue,
        comment: ratingComment
      });
      
      setRatingSubmitting(true);
      dispatch(
        rateStore({
          storeId: currentStoreForRating.id,
          rating: userRatingValue,
          comment: ratingComment
        })
      ).unwrap()
      .then(() => {
        console.log("Rating submitted successfully");
        // The success handler in the other useEffect will handle closing the dialog
      })
      .catch((error) => {
        console.error("Error submitting rating:", error);
        setRatingSubmitting(false);
      });
    } catch (error) {
      console.error("Exception in handleSubmitRating:", error);
      setRatingSubmitting(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    dispatch(manualLogout());
    navigate('/login');
  };

  // Format rating display
  const formatRating = (rating: number | undefined | null) => {
    // Log the rating value to understand the issues
    console.log('Formatting rating value:', rating, typeof rating);
    
    if (rating === undefined || rating === null) return "0.0";
    
    // Convert string ratings to numbers if needed
    const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    
    // Check if the value is a valid number after conversion
    if (isNaN(numericRating)) return "0.0";
    
    return numericRating.toFixed(1);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          Browse Stores
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Find stores, view details, and submit your ratings
      </Typography>

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

      {/* Search box */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon color="action" sx={{ mr: 1 }} />
          <TextField
            fullWidth
            label="Search by name or address"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Type to search..."
            size="small"
          />
        </Box>
      </Paper>

      {/* Store Cards */}
      <GridContainer spacing={3}>
        {filteredStores.length === 0 ? (
          <GridItem xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No stores found
              </Typography>
            </Paper>
          </GridItem>
        ) : (
          filteredStores.map((store) => (
            <GridItem xs={12} sm={6} md={4} key={store.id}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {store.name}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {store.address}
                    </Typography>
                  </Box>
                  
                  {/* Overall Rating section */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                      Overall Rating:
                    </Typography>
                    <Rating 
                      value={
                        typeof store.average_rating === 'number' 
                          ? store.average_rating 
                          : parseFloat(store.average_rating as any) || 0
                      } 
                      precision={0.5} 
                      readOnly 
                      size="small"
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({formatRating(store.average_rating)})
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                      Your Rating:
                    </Typography>
                    <Rating 
                      value={store.userRating !== null && store.userRating !== undefined ? store.userRating : 0} 
                      precision={0.5} 
                      readOnly 
                      size="small"
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {store.userRating !== null && store.userRating !== undefined 
                        ? `(${store.userRating})` 
                        : "(Not rated yet)"}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button 
                    size="small" 
                    onClick={() => handleViewDetails(store.id)}
                    variant="outlined"
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    variant="contained"
                    startIcon={<StarIcon />}
                    onClick={() => handleOpenRatingDialog(store)}
                  >
                    {store.userRating ? 'Edit Rating' : 'Rate Store'}
                  </Button>
                </CardActions>
              </Card>
            </GridItem>
          ))
        )}
      </GridContainer>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onClose={handleCloseRatingDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {currentStoreForRating?.userRating ? 'Update Your Rating' : 'Rate This Store'}
        </DialogTitle>
        <DialogContent>
          {currentStoreForRating && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {currentStoreForRating.name}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {currentStoreForRating.address}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Your Rating:
                </Typography>
                <Rating
                  value={userRatingValue}
                  onChange={(_, newValue) => setUserRatingValue(newValue)}
                  precision={1}
                  size="large"
                  sx={{ fontSize: '2.5rem', my: 1 }}
                />
                {userRatingValue && (
                  <Typography variant="h6" color="primary">
                    {userRatingValue.toFixed(1)}
                  </Typography>
                )}
              </Box>

              <TextField
                label="Share your experience (optional)"
                multiline
                rows={4}
                fullWidth
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Tell others about your experience with this store..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseRatingDialog} variant="outlined">Cancel</Button>
          <Button
            onClick={handleSubmitRating}
            color="primary"
            variant="contained"
            disabled={!userRatingValue || ratingSubmitting}
            startIcon={ratingSubmitting ? <CircularProgress size={20} /> : <StarIcon />}
          >
            {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Stores; 