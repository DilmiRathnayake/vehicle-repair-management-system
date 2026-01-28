const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all repair requests
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                r.*,
                v.registration_number,
                v.vehicle_type,
                v.hospital_name,
                v.current_status as vehicle_status,
                o.name as engineer_name,
                o.email as engineer_email
            FROM repair_requests r
            LEFT JOIN vehicles v ON r.vehicle_id = v.id
            LEFT JOIN officers o ON r.engineer_id = o.id
            ORDER BY r.created_at DESC
        `);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching repair requests:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch repair requests'
        });
    }
});

// GET repair requests by status
router.get('/status/:status', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                r.*,
                v.registration_number,
                v.vehicle_type,
                v.hospital_name,
                o.name as engineer_name
            FROM repair_requests r
            LEFT JOIN vehicles v ON r.vehicle_id = v.id
            LEFT JOIN officers o ON r.engineer_id = o.id
            WHERE r.status = ?
            ORDER BY r.created_at DESC
        `, [req.params.status]);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching repair requests by status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch repair requests'
        });
    }
});

// GET single repair request
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                r.*,
                v.registration_number,
                v.vehicle_type,
                v.hospital_name,
                o.name as engineer_name,
                o.email as engineer_email
            FROM repair_requests r
            LEFT JOIN vehicles v ON r.vehicle_id = v.id
            LEFT JOIN officers o ON r.engineer_id = o.id
            WHERE r.id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Repair request not found'
            });
        }
        
        // Get status history
        const [history] = await db.execute(`
            SELECT 
                s.*,
                o.name as officer_name,
                o.role as officer_role
            FROM status_updates s
            LEFT JOIN officers o ON s.officer_id = o.id
            WHERE s.repair_request_id = ?
            ORDER BY s.updated_at DESC
        `, [req.params.id]);
        
        res.json({
            success: true,
            data: {
                ...rows[0],
                history: history
            }
        });
    } catch (error) {
        console.error('Error fetching repair request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch repair request'
        });
    }
});

// POST create repair request
router.post('/', async (req, res) => {
    const { vehicle_id, engineer_id, repair_details, engineer_signature } = req.body;
    
    // Validation
    if (!vehicle_id || !engineer_id || !repair_details) {
        return res.status(400).json({
            success: false,
            error: 'Vehicle ID, engineer ID, and repair details are required'
        });
    }
    
    try {
        // Start transaction
        await db.execute('START TRANSACTION');
        
        // Create repair request
        const [result] = await db.execute(`
            INSERT INTO repair_requests 
            (vehicle_id, engineer_id, repair_details, engineer_signature, inspection_date, status) 
            VALUES (?, ?, ?, ?, CURDATE(), 'pending')
        `, [vehicle_id, engineer_id, repair_details, engineer_signature || null]);
        
        // Update vehicle status
        await db.execute(
            'UPDATE vehicles SET current_status = "under_repair" WHERE id = ?',
            [vehicle_id]
        );
        
        // Record initial status
        await db.execute(
            'INSERT INTO status_updates (repair_request_id, officer_id, status, comments) VALUES (?, ?, ?, ?)',
            [result.insertId, engineer_id, 'pending', 'Repair request created by engineer']
        );
        
        // Commit transaction
        await db.execute('COMMIT');
        
        res.status(201).json({
            success: true,
            message: 'Repair request created successfully',
            repairId: result.insertId
        });
    } catch (error) {
        // Rollback on error
        await db.execute('ROLLBACK');
        console.error('Error creating repair request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create repair request'
        });
    }
});

// PUT update repair status
router.put('/:id/status', async (req, res) => {
    const { status, officer_id, comments } = req.body;
    const repairId = req.params.id;
    
    // Validation
    if (!status || !officer_id) {
        return res.status(400).json({
            success: false,
            error: 'Status and officer ID are required'
        });
    }
    
    const validStatuses = ['pending', 'sent_to_rdhs', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid status value'
        });
    }
    
    try {
        // Start transaction
        await db.execute('START TRANSACTION');
        
        // Update repair request status
        const [updateResult] = await db.execute(
            'UPDATE repair_requests SET status = ? WHERE id = ?',
            [status, repairId]
        );
        
        if (updateResult.affectedRows === 0) {
            await db.execute('ROLLBACK');
            return res.status(404).json({
                success: false,
                error: 'Repair request not found'
            });
        }
        
        // Record status update
        await db.execute(
            'INSERT INTO status_updates (repair_request_id, officer_id, status, comments) VALUES (?, ?, ?, ?)',
            [repairId, officer_id, status, comments || '']
        );
        
        // If approved, update vehicle status
        if (status === 'approved') {
            const [repair] = await db.execute(
                'SELECT vehicle_id FROM repair_requests WHERE id = ?',
                [repairId]
            );
            
            if (repair[0]) {
                await db.execute(
                    'UPDATE vehicles SET current_status = "repaired" WHERE id = ?',
                    [repair[0].vehicle_id]
                );
            }
        }
        
        // Commit transaction
        await db.execute('COMMIT');
        
        res.json({
            success: true,
            message: `Repair request ${status} successfully`
        });
    } catch (error) {
        // Rollback on error
        await db.execute('ROLLBACK');
        console.error('Error updating repair status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update repair status'
        });
    }
});

// GET repair requests for specific engineer
router.get('/engineer/:engineerId', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                r.*,
                v.registration_number,
                v.vehicle_type,
                v.hospital_name
            FROM repair_requests r
            LEFT JOIN vehicles v ON r.vehicle_id = v.id
            WHERE r.engineer_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.engineerId]);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching engineer repairs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch repair requests'
        });
    }
});

// GET statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const [statusCount] = await db.execute(`
            SELECT 
                status,
                COUNT(*) as count
            FROM repair_requests
            GROUP BY status
        `);
        
        const [monthlyStats] = await db.execute(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count
            FROM repair_requests
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
            LIMIT 6
        `);
        
        res.json({
            success: true,
            data: {
                statusCount,
                monthlyStats
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

module.exports = router;