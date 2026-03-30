const WatchlistItem = require('../models/WatchlistItem');

/**
 * @route   GET /watchlist
 * @desc    READ OPERATION: Fetches the logged-in user's watchlist, supporting optional status filtering.
 */
exports.getWatchlist = async (req, res) => {
  try {
    const filterStatus = req.query.status; 
    
    // Base database query: strictly limit results to the authenticated user
    let dbQuery = { user: req.session.user.id };

    // Apply filter if a valid status parameter is present in the URL
    const validStatuses = ['Plan to Watch', 'Watching', 'Completed', 'Dropped'];
    if (filterStatus && validStatuses.includes(filterStatus)) {
      dbQuery.status = filterStatus; 
    }

    // Execute query and sort by newest additions first
    const items = await WatchlistItem.find(dbQuery).sort({ createdAt: -1 });
    
    res.render('watchlist', { 
      items, 
      error: null, 
      currentFilter: filterStatus || 'All' 
    });

  } catch (err) {
    console.error('Error fetching watchlist:', err);
    res.render('watchlist', { items: [], error: 'Could not load your watchlist.', currentFilter: 'All' });
  }
};

/**
 * @route   POST /watchlist/add
 * @desc    CREATE OPERATION: Adds a new movie/anime to the user's database list.
 */
exports.addToWatchlist = async (req, res) => {
  try {
    const { externalApiId, title, poster_url, mediaType } = req.body; 
    const userId = req.session.user.id;

    // Prevent duplicate entries by checking if the user already has this external ID saved
    const existingItem = await WatchlistItem.findOne({ user: userId, externalApiId });
    if (existingItem) {
      return res.redirect('/watchlist'); 
    }

    const newItem = new WatchlistItem({
      user: userId,
      externalApiId,
      title,
      poster_url,
      mediaType 
    });
    
    await newItem.save();
    res.redirect('/watchlist');

  } catch (err) {
    console.error('Error adding to watchlist:', err);
    res.redirect('/search'); 
  }
};

/**
 * @route   POST /watchlist/update/:id
 * @desc    UPDATE OPERATION: Modifies the watch status or user rating of a specific item.
 */
exports.updateItem = async (req, res) => {
  try {
    const { status, rating } = req.body;
    
    // Ensure the item being updated explicitly belongs to the currently logged-in user
    await WatchlistItem.findOneAndUpdate(
      { _id: req.params.id, user: req.session.user.id },
      { 
        status: status, 
        rating: rating ? Number(rating) : null 
      }
    );
    res.redirect('/watchlist');
  } catch (err) {
    console.error('Error updating item:', err);
    res.redirect('/watchlist');
  }
};

/**
 * @route   POST /watchlist/delete/:id
 * @desc    DELETE OPERATION: Removes an item from the database entirely.
 */
exports.deleteItem = async (req, res) => {
  try {
    // Ensure the item being deleted explicitly belongs to the currently logged-in user
    await WatchlistItem.findOneAndDelete({ _id: req.params.id, user: req.session.user.id });
    res.redirect('/watchlist');
  } catch (err) {
    console.error('Error deleting item:', err);
    res.redirect('/watchlist');
  }
};