const express = require('express');
const cors = require('cors');

const app = express();

// Allow all origins for testing
app.use(cors());
app.use(express.json());

// Test users data
const users = [
    { id: 1, name: 'Engineer John', email: 'engineer@hospital.com', password: 'password123', role: 'engineer' },
    { id: 2, name: 'Subject Officer', email: 'officer@rdhs.com', password: 'password123', role: 'subject_officer' },
    { id: 3, name: 'RDHS Manager', email: 'rdhs@health.gov', password: 'password123', role: 'rdhs' },
    { id: 4, name: 'System Admin', email: 'admin@system.com', password: 'admin123', role: 'admin' }
];

// Vehicles data
const vehicles = [
    { id: 1, registration_number: 'CAB-1234', vehicle_type: 'Ambulance', hospital_name: 'Base Hospital Colombo', current_status: 'operational', created_at: '2024-01-01' },
    { id: 2, registration_number: 'CAB-5678', vehicle_type: 'Van', hospital_name: 'MOH Office Gampaha', current_status: 'under_repair', created_at: '2024-01-02' },
    { id: 3, registration_number: 'WP-AB-9012', vehicle_type: 'Car', hospital_name: 'Base Hospital Kalutara', current_status: 'repaired', created_at: '2024-01-03' },
    { id: 4, registration_number: 'CAB-9011', vehicle_type: 'Ambulance', hospital_name: 'Base Hospital Kandy', current_status: 'operational', created_at: '2024-01-04' }
];

// Repair requests data
const repairs = [
    { 
        id: 1, 
        vehicle_id: 1, 
        engineer_id: 1,
        registration_number: 'CAB-1234',
        vehicle_type: 'Ambulance',
        hospital_name: 'Base Hospital Colombo',
        repair_details: 'Engine overheating problem needs fixing',
        engineer_name: 'Engineer John',
        engineer_signature: 'Engineer John',
        status: 'pending',
        inspection_date: '2024-01-10',
        created_at: '2024-01-10'
    },
    { 
        id: 2, 
        vehicle_id: 2, 
        engineer_id: 1,
        registration_number: 'CAB-5678',
        vehicle_type: 'Van',
        hospital_name: 'MOH Office Gampaha',
        repair_details: 'Brake system needs replacement',
        engineer_name: 'Engineer John',
        engineer_signature: 'Engineer John',
        status: 'sent_to_rdhs',
        inspection_date: '2024-01-11',
        created_at: '2024-01-11'
    },
    { 
        id: 3, 
        vehicle_id: 3, 
        engineer_id: 1,
        registration_number: 'WP-AB-9012',
        vehicle_type: 'Car',
        hospital_name: 'Base Hospital Kalutara',
        repair_details: 'Transmission issue fixed',
        engineer_name: 'Engineer John',
        engineer_signature: 'Engineer John',
        status: 'approved',
        inspection_date: '2024-01-12',
        created_at: '2024-01-12'
    }
];

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: '✅ Vehicle Repair System API is running!',
        version: '1.0.0',
        endpoints: {
            auth: ['POST /api/auth/login', 'GET /api/auth/officers'],
            vehicles: ['GET /api/vehicles', 'GET /api/vehicles/search/:reg'],
            repairs: ['GET /api/repairs', 'GET /api/repairs/stats/summary']
        }
    });
});

// ========== AUTH ROUTES ==========
app.post('/api/auth/login', (req, res) => {
    console.log('📨 Login request:', req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email and password are required'
        });
    }
    
    const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
    );
    
    if (user) {
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            message: 'Login successful',
            user: userWithoutPassword,
            token: 'test-token-' + Date.now()
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid email or password'
        });
    }
});

app.get('/api/auth/officers', (req, res) => {
    const officersWithoutPassword = users.map(({ password, ...rest }) => rest);
    res.json({
        success: true,
        count: officersWithoutPassword.length,
        data: officersWithoutPassword
    });
});

// ========== VEHICLE ROUTES ==========
app.get('/api/vehicles', (req, res) => {
    res.json({
        success: true,
        count: vehicles.length,
        data: vehicles
    });
});

app.get('/api/vehicles/search/:regNumber', (req, res) => {
    const filtered = vehicles.filter(v => 
        v.registration_number.toLowerCase().includes(req.params.regNumber.toLowerCase())
    );
    res.json({
        success: true,
        count: filtered.length,
        data: filtered.length > 0 ? filtered[0] : null
    });
});

app.post('/api/vehicles', (req, res) => {
    const newVehicle = {
        id: vehicles.length + 1,
        ...req.body,
        created_at: new Date().toISOString().split('T')[0]
    };
    vehicles.push(newVehicle);
    res.status(201).json({
        success: true,
        message: 'Vehicle added successfully',
        vehicleId: newVehicle.id
    });
});

// ========== REPAIR ROUTES ==========
app.get('/api/repairs', (req, res) => {
    res.json({
        success: true,
        count: repairs.length,
        data: repairs
    });
});

app.get('/api/repairs/status/:status', (req, res) => {
    const filtered = repairs.filter(r => r.status === req.params.status);
    res.json({
        success: true,
        count: filtered.length,
        data: filtered
    });
});

app.get('/api/repairs/engineer/:engineerId', (req, res) => {
    const engineerRepairs = repairs.filter(r => r.engineer_id === parseInt(req.params.engineerId));
    res.json({
        success: true,
        count: engineerRepairs.length,
        data: engineerRepairs
    });
});

app.post('/api/repairs', (req, res) => {
    const { vehicle_id, engineer_id, repair_details } = req.body;
    
    const vehicle = vehicles.find(v => v.id === vehicle_id);
    const engineer = users.find(u => u.id === engineer_id);
    
    if (!vehicle) {
        return res.status(404).json({
            success: false,
            error: 'Vehicle not found'
        });
    }
    
    const newRepair = {
        id: repairs.length + 1,
        vehicle_id,
        engineer_id,
        registration_number: vehicle.registration_number,
        vehicle_type: vehicle.vehicle_type,
        hospital_name: vehicle.hospital_name,
        repair_details,
        engineer_name: engineer?.name || 'Unknown Engineer',
        engineer_signature: engineer?.name || 'Unknown',
        status: 'pending',
        inspection_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
    };
    
    repairs.push(newRepair);
    
    // Update vehicle status
    vehicle.current_status = 'under_repair';
    
    res.status(201).json({
        success: true,
        message: 'Repair request created',
        repairId: newRepair.id
    });
});

app.put('/api/repairs/:id/status', (req, res) => {
    const repairId = parseInt(req.params.id);
    const { status, officer_id } = req.body;
    
    const repair = repairs.find(r => r.id === repairId);
    
    if (!repair) {
        return res.status(404).json({
            success: false,
            error: 'Repair request not found'
        });
    }
    
    repair.status = status;
    
    // If approved, update vehicle status
    if (status === 'approved') {
        const vehicle = vehicles.find(v => v.registration_number === repair.registration_number);
        if (vehicle) {
            vehicle.current_status = 'repaired';
        }
    }
    
    res.json({
        success: true,
        message: `Repair request ${status} successfully`
    });
});

app.get('/api/repairs/stats/summary', (req, res) => {
    const statusCount = [
        { status: 'pending', count: repairs.filter(r => r.status === 'pending').length },
        { status: 'sent_to_rdhs', count: repairs.filter(r => r.status === 'sent_to_rdhs').length },
        { status: 'approved', count: repairs.filter(r => r.status === 'approved').length },
        { status: 'rejected', count: repairs.filter(r => r.status === 'rejected').length }
    ];
    
    const monthlyStats = [
        { month: '2024-01', count: repairs.length, approved_count: repairs.filter(r => r.status === 'approved').length }
    ];
    
    res.json({
        success: true,
        data: {
            statusCount,
            monthlyStats
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found: ' + req.originalUrl
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend Server running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🔗 API Documentation: http://localhost:${PORT}/`);
    console.log('\n📊 Available Data:');
    console.log(`   👤 Users: ${users.length} accounts`);
    console.log(`   🚗 Vehicles: ${vehicles.length} vehicles`);
    console.log(`   🔧 Repairs: ${repairs.length} repair requests`);
    console.log('\n🔑 Test Logins:');
    users.forEach(u => console.log(`   📧 ${u.email} / ${u.password} (${u.role})`));
});