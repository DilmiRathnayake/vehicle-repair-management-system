const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email and password are required'
        });
    }
    
    try {
        const [rows] = await db.execute(
            'SELECT id, name, email, role FROM officers WHERE email = ? AND password = ?',
            [email, password]
        );
        
        if (rows.length > 0) {
            res.json({
                success: true,
                message: 'Login successful',
                user: rows[0],
                token: `demo-token-${rows[0].id}-${Date.now()}`
            });
        } else {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

// GET current user profile
router.get('/profile', async (req, res) => {
    // For demo, we'll get user from query parameter
    // In real app, you would use JWT token
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'User ID is required'
        });
    }
    
    try {
        const [rows] = await db.execute(
            'SELECT id, name, email, role, created_at FROM officers WHERE id = ?',
            [userId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Get user statistics based on role
        let stats = {};
        const user = rows[0];
        
        if (user.role === 'engineer') {
            const [repairStats] = await db.execute(`
                SELECT 
                    COUNT(*) as total_requests,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_requests
                FROM repair_requests 
                WHERE engineer_id = ?
            `, [user.id]);
            
            stats = repairStats[0];
        } else if (user.role === 'subject_officer') {
            const [officerStats] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT r.id) as reviewed_requests,
                    SUM(CASE WHEN r.status = 'sent_to_rdhs' THEN 1 ELSE 0 END) as forwarded_requests
                FROM repair_requests r
                JOIN status_updates s ON r.id = s.repair_request_id
                WHERE s.officer_id = ?
            `, [user.id]);
            
            stats = officerStats[0];
        } else if (user.role === 'rdhs') {
            const [rdhsStats] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT r.id) as total_decisions,
                    SUM(CASE WHEN r.status = 'approved' THEN 1 ELSE 0 END) as approved_requests,
                    SUM(CASE WHEN r.status = 'rejected' THEN 1 ELSE 0 END) as rejected_requests
                FROM repair_requests r
                WHERE r.status IN ('approved', 'rejected')
            `);
            
            stats = rdhsStats[0];
        }
        
        res.json({
            success: true,
            user: user,
            stats: stats
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile'
        });
    }
});

// POST logout (for future JWT implementation)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// GET all officers (for admin)
router.get('/officers', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, name, email, role, created_at FROM officers ORDER BY name'
        );
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching officers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch officers'
        });
    }
});

module.exports = router;