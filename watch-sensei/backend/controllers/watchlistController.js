const WatchlistItem = require('../models/WatchlistItem');

/**
 * @route   GET /api/watchlist
 * @desc    READ: Fetches the logged-in user's watchlist, supporting optional status filtering.
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
    
    // REST Response (200 OK)
    res.status(200).json({ 
      success: true,
      data: items,
      currentFilter: filterStatus || 'All' 
    });

  } catch (err) {
    console.error('Error fetching watchlist:', err);
    res.status(500).json({ success: false, message: 'Could not load your watchlist.' });
  }
};

/**
 * @route   POST /api/watchlist
 * @desc    CREATE: Adds a new movie/anime to the user's database list.
 */
exports.addToWatchlist = async (req, res) => {
  try {
    const { externalApiId, title, poster_url, mediaType } = req.body; 
    const userId = req.session.user.id;

    // Prevent duplicate entries (409 Conflict)
    const existingItem = await WatchlistItem.findOne({ user: userId, externalApiId });
    if (existingItem) {
      return res.status(409).json({ success: false, message: 'This item is already in your watchlist.' }); 
    }

    const newItem = new WatchlistItem({
      user: userId,
      externalApiId,
      title,
      poster_url,
      mediaType, 
      status: req.body.status || 'Plan to Watch',
      liked: req.body.liked || false
    });
    
    await newItem.save();
    
    // REST Response (201 Created)
    res.status(201).json({ success: true, message: 'Added to watchlist successfully.', data: newItem });

  } catch (err) {
    console.error('Error adding to watchlist:', err);
    res.status(500).json({ success: false, message: 'Failed to add item to watchlist.' }); 
  }
};

/**
 * @route   PUT /api/watchlist/:id
 * @desc    UPDATE: Modifies the watch status or user rating of a specific item.
 */
exports.updateItem = async (req, res) => {
  try {
    const { status, rating } = req.body;
    
    // Ensure the item explicitly belongs to the currently logged-in user
    const updatedItem = await WatchlistItem.findOneAndUpdate(
      { _id: req.params.id, user: req.session.user.id },
      { 
        status: status, 
        rating: rating ? Number(rating) : null 
      },
      { new: true } // Tells Mongoose to return the updated document, not the old one
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Item not found or unauthorized.' });
    }

    // REST Response (200 OK)
    res.status(200).json({ success: true, message: 'Item updated successfully.', data: updatedItem });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ success: false, message: 'Failed to update item.' });
  }
};

/**
 * @route   DELETE /api/watchlist/:id
 * @desc    DELETE: Removes an item from the database entirely.
 */
exports.deleteItem = async (req, res) => {
  try {
    // Ensure the item being deleted explicitly belongs to the currently logged-in user
    const deletedItem = await WatchlistItem.findOneAndDelete({ _id: req.params.id, user: req.session.user.id });
    
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Item not found or unauthorized.' });
    }

    // REST Response (200 OK)
    res.status(200).json({ success: true, message: 'Item removed from watchlist.' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ success: false, message: 'Failed to delete item.' });
  }
};