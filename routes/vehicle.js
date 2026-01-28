const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all vehicles
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM vehicles ORDER BY created_at DESC'
        );
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vehicles'
        });
    }
});

// GET single vehicle by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM vehicles WHERE id = ?',
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Vehicle not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vehicle'
        });
    }
});

// SEARCH vehicle by registration number
router.get('/search/:regNumber', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM vehicles WHERE registration_number LIKE ?',
            [`%${req.params.regNumber}%`]
        );
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error searching vehicle:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search vehicle'
        });
    }
});

// POST create new vehicle
router.post('/', async (req, res) => {
    const { registration_number, vehicle_type, hospital_name } = req.body;
    
    // Validation
    if (!registration_number || !vehicle_type) {
        return res.status(400).json({
            success: false,
            error: 'Registration number and vehicle type are required'
        });
    }
    
    try {
        const [result] = await db.execute(
            'INSERT INTO vehicles (registration_number, vehicle_type, hospital_name) VALUES (?, ?, ?)',
            [registration_number, vehicle_type, hospital_name || null]
        );
        
        res.status(201).json({
            success: true,
            message: 'Vehicle added successfully',
            vehicleId: result.insertId
        });
    } catch (error) {
        console.error('Error creating vehicle:', error);
        
        // Handle duplicate entry
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                error: 'Vehicle registration number already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to add vehicle'
        });
    }
});

// PUT update vehicle
router.put('/:id', async (req, res) => {
    const { registration_number, vehicle_type, hospital_name, current_status } = req.body;
    
    try {
        const [result] = await db.execute(
            `UPDATE vehicles 
             SET registration_number = ?, 
                 vehicle_type = ?, 
                 hospital_name = ?, 
                 current_status = ?
             WHERE id = ?`,
            [registration_number, vehicle_type, hospital_name, current_status, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Vehicle not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Vehicle updated successfully'
        });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update vehicle'
        });
    }
});

// DELETE vehicle
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM vehicles WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Vehicle not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete vehicle'
        });
    }
});

// GET vehicles by status
router.get('/status/:status', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM vehicles WHERE current_status = ? ORDER BY created_at DESC',
            [req.params.status]
        );
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching vehicles by status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vehicles'
        });
    }
});

module.exports = router;