// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Post title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Post content is required'] 
    },
    image: {
        type: String, // This will store the file path to the uploaded image
        required: false 
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Establishes the relationship to the User model 
        required: true
    }
}, { 
    timestamps: true // Automatically creates createdAt and updatedAt fields 
});

module.exports = mongoose.model('Post', postSchema);