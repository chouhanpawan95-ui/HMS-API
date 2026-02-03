// routes/usermasterRoutes.js
const express = require('express');
const router = express.Router();
const usermasterController = require('../controllers/usermasterController');

// CRUD Operations
router.post('/', usermasterController.createUser);                                    // Create user
router.get('/', usermasterController.getUsers);                                       // Get all users with pagination and search
router.get('/next-id', usermasterController.getNextUserId);                           // Get next user ID
router.get('/by-login-name/:loginName', usermasterController.getUserByLoginName);    // Get user by LoginName
router.get('/by-type/:userType', usermasterController.getUsersByType);               // Get users by type
router.get('/active', usermasterController.getActiveUsers);                          // Get active users
router.get('/:id', usermasterController.getUserById);                                // Get user by ID (PK_UserId or MongoDB _id)
router.put('/:id', usermasterController.updateUser);                                 // Update user
router.delete('/:id', usermasterController.deleteUser);                              // Delete user

module.exports = router;
