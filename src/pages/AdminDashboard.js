import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Alert,
  Badge,
  InputGroup,
  FormControl,
  Tabs,
  Tab,
  Dropdown,
  ProgressBar,
  ListGroup,
  ListGroupItem
} from 'react-bootstrap';
import {
  FaUsers,
  FaCar,
  FaTools,
  FaChartBar,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaEye,
  FaHistory,
  FaCog,
  FaDatabase,
  FaShieldAlt,
  FaBell,
  FaEnvelope,
  FaKey,
  FaUserCog,
  FaHospital,
  FaAmbulance,
  FaFileExport,
  FaSync,
  FaUserCheck,
  FaUserTimes,
  FaCheck
} from 'react-icons/fa';
import { authAPI, vehicleAPI, repairAPI } from '../services/api';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Users state
  const [officers, setOfficers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'engineer'
  });
  
  // Vehicles state
  const [vehicles, setVehicles] = useState([]);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleFormData, setVehicleFormData] = useState({
    registration_number: '',
    vehicle_type: '',
    hospital_name: '',
    current_status: 'operational'
  });
  
  // System stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalRepairs: 0,
    pendingRepairs: 0,
    approvedRepairs: 0
  });
  
  // Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    // In real app, check if user is admin
    if (!storedUser) {
      window.location.href = '/login';
      return;
    }
    setUser(storedUser);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersRes, vehiclesRes, repairsRes] = await Promise.all([
        authAPI.getOfficers(),
        vehicleAPI.getAll(),
        repairAPI.getAll()
      ]);
      
      setOfficers(usersRes.data.data);
      setVehicles(vehiclesRes.data.data);
      
      const repairs = repairsRes.data.data;
      const pendingRepairs = repairs.filter(r => r.status === 'pending' || r.status === 'sent_to_rdhs').length;
      const approvedRepairs = repairs.filter(r => r.status === 'approved').length;
      
      setStats({
        totalUsers: usersRes.data.data.length,
        totalVehicles: vehiclesRes.data.data.length,
        totalRepairs: repairs.length,
        pendingRepairs,
        approvedRepairs
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // User Management Functions
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // In a real app, you would call API to create/update user
    // For now, we'll simulate it
    
    setSuccess(selectedUser 
      ? `User ${userFormData.name} updated successfully!`
      : `User ${userFormData.name} created successfully!`
    );
    
    setShowUserModal(false);
    resetUserForm();
    fetchDashboardData();
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show password
      role: user.role
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // In real app, call API to delete user
      setSuccess('User deleted successfully!');
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const resetUserForm = () => {
    setSelectedUser(null);
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role: 'engineer'
    });
  };

  // Vehicle Management Functions
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (selectedUser) {
        await vehicleAPI.update(selectedUser.id, vehicleFormData);
        setSuccess('Vehicle updated successfully!');
      } else {
        await vehicleAPI.create(vehicleFormData);
        setSuccess('Vehicle added successfully!');
      }
      
      setShowVehicleModal(false);
      resetVehicleForm();
      fetchDashboardData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save vehicle');
    }
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedUser(vehicle);
    setVehicleFormData({
      registration_number: vehicle.registration_number,
      vehicle_type: vehicle.vehicle_type,
      hospital_name: vehicle.hospital_name,
      current_status: vehicle.current_status
    });
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        await vehicleAPI.delete(vehicleId);
        setSuccess('Vehicle deleted successfully!');
        fetchDashboardData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete vehicle');
      }
    }
  };

  const resetVehicleForm = () => {
    setSelectedUser(null);
    setVehicleFormData({
      registration_number: '',
      vehicle_type: '',
      hospital_name: '',
      current_status: 'operational'
    });
  };

  // System functions
  const exportData = async () => {
    // In real app, implement data export
    alert('Export functionality would be implemented here');
  };

  const backupDatabase = async () => {
    // In real app, implement backup
    alert('Database backup functionality would be implemented here');
  };

  const sendSystemNotification = () => {
    // In real app, implement notifications
    alert('System notification functionality would be implemented here');
  };

  const getRoleBadge = (role) => {
    const colors = {
      engineer: 'warning',
      subject_officer: 'info',
      rdhs: 'success',
      admin: 'danger'
    };
    
    return (
      <Badge bg={colors[role] || 'secondary'}>
        {role.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Header user={user} />
      <Container fluid className="dashboard-container">
        {success && (
          <Alert variant="success" className="alert-dismissible fade show" dismissible onClose={() => setSuccess('')}>
            <FaCheck className="me-2" /> {success}
          </Alert>
        )}
        
        {error && (
          <Alert variant="danger" className="alert-dismissible fade show" dismissible onClose={() => setError('')}>
            <FaUserTimes className="me-2" /> {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-primary">
                  <FaUsers />
                </div>
                <div className="stats-value">{stats.totalUsers}</div>
                <div className="stats-label">Total Users</div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-success">
                  <FaCar />
                </div>
                <div className="stats-value">{stats.totalVehicles}</div>
                <div className="stats-label">Vehicles</div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-warning">
                  <FaTools />
                </div>
                <div className="stats-value">{stats.totalRepairs}</div>
                <div className="stats-label">Repair Requests</div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-danger">
                  <FaChartBar />
                </div>
                <div className="stats-value">{stats.approvedRepairs}</div>
                <div className="stats-label">Approved Repairs</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Content with Tabs */}
        <Card className="custom-card mb-4">
          <Card.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-3"
            >
              <Tab eventKey="overview" title={
                <span>
                  <FaChartBar className="me-1" />
                  Overview
                </span>
              }>
                <Row className="mt-3">
                  <Col md={6}>
                    <Card className="custom-card">
                      <Card.Header>
                        <h5 className="mb-0">System Status</h5>
                      </Card.Header>
                      <Card.Body>
                        <ListGroup variant="flush">
                          <ListGroupItem className="d-flex justify-content-between align-items-center">
                            <span>Database Status</span>
                            <Badge bg="success">Online</Badge>
                          </ListGroupItem>
                          <ListGroupItem className="d-flex justify-content-between align-items-center">
                            <span>API Status</span>
                            <Badge bg="success">Running</Badge>
                          </ListGroupItem>
                          <ListGroupItem className="d-flex justify-content-between align-items-center">
                            <span>Last Backup</span>
                            <span className="text-muted">2 hours ago</span>
                          </ListGroupItem>
                          <ListGroupItem className="d-flex justify-content-between align-items-center">
                            <span>Active Users</span>
                            <Badge bg="info">3</Badge>
                          </ListGroupItem>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="custom-card">
                      <Card.Header>
                        <h5 className="mb-0">Quick Actions</h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-grid gap-2">
                          <Button 
                            variant="primary" 
                            className="d-flex align-items-center"
                            onClick={exportData}
                          >
                            <FaFileExport className="me-2" /> Export System Data
                          </Button>
                          <Button 
                            variant="success" 
                            className="d-flex align-items-center"
                            onClick={backupDatabase}
                          >
                            <FaDatabase className="me-2" /> Backup Database
                          </Button>
                          <Button 
                            variant="warning" 
                            className="d-flex align-items-center"
                            onClick={() => setActiveTab('users')}
                          >
                            <FaUserPlus className="me-2" /> Add New User
                          </Button>
                          <Button 
                            variant="info" 
                            className="d-flex align-items-center"
                            onClick={sendSystemNotification}
                          >
                            <FaBell className="me-2" /> Send Notification
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
              
              <Tab eventKey="users" title={
                <span>
                  <FaUsers className="me-1" />
                  User Management
                  <Badge bg="primary" className="ms-2">{stats.totalUsers}</Badge>
                </span>
              }>
                <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
                  <h5 className="mb-0">System Users</h5>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      resetUserForm();
                      setShowUserModal(true);
                    }}
                  >
                    <FaUserPlus className="me-2" /> Add New User
                  </Button>
                </div>
                
                <Table hover responsive className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officers.map((officer) => (
                      <tr key={officer.id}>
                        <td>#{officer.id}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                 style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                              {officer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            {officer.name}
                          </div>
                        </td>
                        <td>{officer.email}</td>
                        <td>{getRoleBadge(officer.role)}</td>
                        <td>
                          {new Date(officer.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditUser(officer)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteUser(officer.id)}
                              disabled={officer.id === user?.id}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab>
              
              <Tab eventKey="vehicles" title={
                <span>
                  <FaCar className="me-1" />
                  Vehicle Management
                  <Badge bg="success" className="ms-2">{stats.totalVehicles}</Badge>
                </span>
              }>
                <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
                  <h5 className="mb-0">Vehicle Registry</h5>
                  <Button 
                    variant="success" 
                    onClick={() => {
                      resetVehicleForm();
                      setShowVehicleModal(true);
                    }}
                  >
                    <FaCar className="me-2" /> Add New Vehicle
                  </Button>
                </div>
                
                <Table hover responsive className="custom-table">
                  <thead>
                    <tr>
                      <th>Registration</th>
                      <th>Type</th>
                      <th>Hospital</th>
                      <th>Status</th>
                      <th>Added Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td>
                          <strong>{vehicle.registration_number}</strong>
                        </td>
                        <td>{vehicle.vehicle_type}</td>
                        <td>{vehicle.hospital_name}</td>
                        <td>
                          <StatusBadge status={vehicle.current_status} type="vehicle" />
                        </td>
                        <td>
                          {new Date(vehicle.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditVehicle(vehicle)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab>
              
              <Tab eventKey="settings" title={
                <span>
                  <FaCog className="me-1" />
                  System Settings
                </span>
              }>
                <Row className="mt-3">
                  <Col md={6}>
                    <Card className="custom-card">
                      <Card.Header>
                        <h5 className="mb-0">System Configuration</h5>
                      </Card.Header>
                      <Card.Body>
                        <Form>
                          <Form.Group className="mb-3">
                            <Form.Label>System Name</Form.Label>
                            <Form.Control
                              type="text"
                              defaultValue="Vehicle Repair Management System"
                              className="custom-form-control"
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Email Notifications</Form.Label>
                            <Form.Check
                              type="switch"
                              id="email-notifications"
                              label="Enable email notifications"
                              defaultChecked
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Auto Backup Frequency</Form.Label>
                            <Form.Select className="custom-form-control">
                              <option>Daily</option>
                              <option>Weekly</option>
                              <option>Monthly</option>
                            </Form.Select>
                          </Form.Group>
                          
                          <Button variant="primary" className="w-100">
                            <FaSync className="me-2" /> Save Settings
                          </Button>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="custom-card">
                      <Card.Header>
                        <h5 className="mb-0">Security Settings</h5>
                      </Card.Header>
                      <Card.Body>
                        <Form>
                          <Form.Group className="mb-3">
                            <Form.Label>Password Policy</Form.Label>
                            <Form.Select className="custom-form-control">
                              <option>Minimum 8 characters</option>
                              <option>Minimum 12 characters</option>
                              <option>Complex passwords required</option>
                            </Form.Select>
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Session Timeout</Form.Label>
                            <Form.Select className="custom-form-control">
                              <option>15 minutes</option>
                              <option>30 minutes</option>
                              <option>1 hour</option>
                              <option>2 hours</option>
                            </Form.Select>
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Two-Factor Authentication</Form.Label>
                            <Form.Check
                              type="switch"
                              id="2fa"
                              label="Require 2FA for all users"
                            />
                          </Form.Group>
                          
                          <Button variant="danger" className="w-100">
                            <FaShieldAlt className="me-2" /> Update Security
                          </Button>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>

      {/* User Modal */}
      <Modal
        show={showUserModal}
        onHide={() => {
          setShowUserModal(false);
          resetUserForm();
        }}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUserSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control
                type="text"
                value={userFormData.name}
                onChange={(e) => setUserFormData({
                  ...userFormData,
                  name: e.target.value
                })}
                placeholder="Enter full name"
                className="custom-form-control"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email Address *</Form.Label>
              <Form.Control
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({
                  ...userFormData,
                  email: e.target.value
                })}
                placeholder="Enter email address"
                className="custom-form-control"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                {selectedUser ? 'New Password (leave blank to keep current)' : 'Password *'}
              </Form.Label>
              <Form.Control
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({
                  ...userFormData,
                  password: e.target.value
                })}
                placeholder="Enter password"
                className="custom-form-control"
                required={!selectedUser}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Role *</Form.Label>
              <Form.Select
                value={userFormData.role}
                onChange={(e) => setUserFormData({
                  ...userFormData,
                  role: e.target.value
                })}
                className="custom-form-control"
                required
              >
                <option value="engineer">Engineer</option>
                <option value="subject_officer">Subject Officer</option>
                <option value="rdhs">RDHS</option>
                <option value="admin">Administrator</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowUserModal(false);
                  resetUserForm();
                }}
                className="btn-custom"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="btn-custom btn-custom-primary"
              >
                {selectedUser ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Vehicle Modal */}
      <Modal
        show={showVehicleModal}
        onHide={() => {
          setShowVehicleModal(false);
          resetVehicleForm();
        }}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser ? 'Edit Vehicle' : 'Add New Vehicle'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleVehicleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Registration Number *</Form.Label>
              <Form.Control
                type="text"
                value={vehicleFormData.registration_number}
                onChange={(e) => setVehicleFormData({
                  ...vehicleFormData,
                  registration_number: e.target.value.toUpperCase()
                })}
                placeholder="Enter registration number"
                className="custom-form-control"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Vehicle Type *</Form.Label>
              <Form.Select
                value={vehicleFormData.vehicle_type}
                onChange={(e) => setVehicleFormData({
                  ...vehicleFormData,
                  vehicle_type: e.target.value
                })}
                className="custom-form-control"
                required
              >
                <option value="">Select vehicle type</option>
                <option value="Ambulance">Ambulance</option>
                <option value="Van">Van</option>
                <option value="Car">Car</option>
                <option value="Bus">Bus</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Truck">Truck</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Hospital Name *</Form.Label>
              <Form.Control
                type="text"
                value={vehicleFormData.hospital_name}
                onChange={(e) => setVehicleFormData({
                  ...vehicleFormData,
                  hospital_name: e.target.value
                })}
                placeholder="Enter hospital name"
                className="custom-form-control"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Current Status *</Form.Label>
              <Form.Select
                value={vehicleFormData.current_status}
                onChange={(e) => setVehicleFormData({
                  ...vehicleFormData,
                  current_status: e.target.value
                })}
                className="custom-form-control"
                required
              >
                <option value="operational">Operational</option>
                <option value="under_repair">Under Repair</option>
                <option value="repaired">Repaired</option>
                <option value="approved">Approved</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowVehicleModal(false);
                  resetVehicleForm();
                }}
                className="btn-custom"
              >
                Cancel
              </Button>
              <Button
                variant="success"
                type="submit"
                className="btn-custom btn-custom-success"
              >
                {selectedUser ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AdminDashboard;