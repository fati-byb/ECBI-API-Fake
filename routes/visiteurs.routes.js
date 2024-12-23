const express = require('express');
const router = express.Router();
const visiteurController = require('../controllers/visiteurs/visiteur.controller'); // Adjust path

// Get all visitors
router.get('/getVisiteurs', visiteurController.getVisitors);

// Get a visitor by email
router.get('/getVisitors/:email', visiteurController.getVisitorByEmail);

// Create a new visitor
router.post('/addVisitor', visiteurController.createVisitor);

// Update a visitor's number of visits
router.put('/updateVisitor/:email', visiteurController.updateVisitorVisits);

// Delete a visitor
router.delete('/deleteVisitors/:email', visiteurController.deleteVisitor);

module.exports = router;
