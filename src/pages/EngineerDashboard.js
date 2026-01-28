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
  ProgressBar
} from 'react-bootstrap';
import { 
  FaPlus, 
  FaSearch, 
  FaCar, 
  FaTools, 
  FaClock, 
  FaCheckCircle,
  FaExclamationCircle,
  FaFileAlt,
  FaFilter,
  FaPrint,
  FaDownload
} from 'react-icons/fa';
import { vehicleAPI, repairAPI } from '../services/api';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';

function EngineerDashboard() {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [repairRequests, setRepairRequests] = useState([]);
  const [filteredRepairs, setFilteredRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    registration_number: '',
    repair_details: '',
    estimated_cost: '',
    parts_needed: ''
  });
  const [searchedVehicle, setSearchedVehicle] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.role !== 'engineer') {
      window.location.href = '/login';
      return;
    }
    setUser(storedUser);
    fetchDashboardData();
  }, []);

  useEffect(() => {
    filterRepairs();
  }, [searchTerm, statusFilter, repairRequests]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, repairsRes] = await Promise.all([
        vehicleAPI.getAll(),
        repairAPI.getEngineerRepairs(user ? user.id : 1)
      ]);
      
      setVehicles(vehiclesRes.data.data);
      setRepairRequests(repairsRes.data.data);
      setFilteredRepairs(repairsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filterRepairs = () => {
    let filtered = repairRequests;

    if (searchTerm) {
      filtered = filtered.filter(repair =>
        repair.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.repair_details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(repair => repair.status === statusFilter);
    }

    setFilteredRepairs(filtered);
  };

  const searchVehicle = async () => {
    if (!formData.registration_number.trim()) {
      setError('Please enter a registration number');
      return;
    }

    try {
      setSearching(true);
      const response = await vehicleAPI.search(formData.registration_number);
      
      if (response.data.data.length > 0) {
        setSearchedVehicle(response.data.data[0]);
        setError('');
      } else {
        setSearchedVehicle(null);
        setError('Vehicle not found! Please check the registration number.');
      }
    } catch (error) {
      setError('Error searching for vehicle');
      setSearchedVehicle(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!searchedVehicle) {
      setError('Please search and select a vehicle first');
      return;
    }

    if (!formData.repair_details.trim()) {
      setError('Please enter repair details');
      return;
    }

    try {
      await repairAPI.create({
        vehicle_id: searchedVehicle.id,
        engineer_id: user.id,
        repair_details: formData.repair_details,
        estimated_cost: formData.estimated_cost,
        parts_needed: formData.parts_needed,
        engineer_signature: user.name
      });

      setSuccess('Repair request submitted successfully!');
      setShowForm(false);
      resetForm();
      fetchDashboardData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit repair request');
    }
  };

  const resetForm = () => {
    setFormData({
      registration_number: '',
      repair_details: '',
      estimated_cost: '',
      parts_needed: ''
    });
    setSearchedVehicle(null);
    setError('');
  };

  const getStats = () => {
    const total = repairRequests.length;
    const pending = repairRequests.filter(r => r.status === 'pending').length;
    const approved = repairRequests.filter(r => r.status === 'approved').length;
    const rejected = repairRequests.filter(r => r.status === 'rejected').length;
    const inProgress = repairRequests.filter(r => r.status === 'sent_to_rdhs').length;

    return { total, pending, approved, rejected, inProgress };
  };

  const stats = getStats();

  if (loading && !user) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Header user={user} />
      <Container fluid className="dashboard-container">
        {success && (
          <Alert variant="success" className="alert-dismissible fade show" dismissible onClose={() => setSuccess('')}>
            <FaCheckCircle className="me-2" /> {success}
          </Alert>
        )}
        
        {error && (
          <Alert variant="danger" className="alert-dismissible fade show" dismissible onClose={() => setError('')}>
            <FaExclamationCircle className="me-2" /> {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-primary">
                  <FaCar />
                </div>
                <div className="stats-value">{stats.total}</div>
                <div className="stats-label">Total Repairs</div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-warning">
                  <FaClock />
                </div>
                <div className="stats-value">{stats.pending}</div>
                <div className="stats-label">Pending</div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-info">
                  <FaTools />
                </div>
                <div className="stats-value">{stats.inProgress}</div>
                <div className="stats-label">In Progress</div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-success">
                  <FaCheckCircle />
                </div>
                <div className="stats-value">{stats.approved}</div>
                <div className="stats-label">Approved</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Action Bar */}
        <Row className="mb-4">
          <Col>
            <Card className="custom-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Repair Management</h5>
                  <Button 
                    variant="primary" 
                    className="btn-custom btn-custom-primary"
                    onClick={() => setShowForm(true)}
                  >
                    <FaPlus className="me-2" /> New Repair Request
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters and Search */}
        <Row className="mb-4">
          <Col>
            <Card className="custom-card">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <InputGroup>
                      <FormControl
                        placeholder="Search by vehicle number, type, or repair details..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="custom-form-control"
                      />
                      <Button variant="outline-secondary">
                        <FaSearch />
                      </Button>
                    </InputGroup>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-center">
                      <FaFilter className="me-2" />
                      <Form.Select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="custom-form-control"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="sent_to_rdhs">Sent to RDHS</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </Form.Select>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Repair Requests Table */}
        <Row>
          <Col>
            <Card className="custom-card">
              <Card.Header>
                <h5 className="mb-0">My Repair Requests</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <LoadingSpinner />
                ) : filteredRepairs.length === 0 ? (
                  <div className="text-center py-5">
                    <FaFileAlt size={48} className="text-muted mb-3" />
                    <h4>No repair requests found</h4>
                    <p className="text-muted">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try changing your search criteria' 
                        : 'Start by creating your first repair request'}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="custom-table">
                      <thead>
                        <tr>
                          <th>Vehicle Details</th>
                          <th>Repair Details</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRepairs.map((request) => (
                          <tr key={request.id}>
                            <td>
                              <div>
                                <strong>{request.registration_number}</strong>
                                <div className="text-muted small">
                                  {request.vehicle_type} • {request.hospital_name}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="text-truncate" style={{ maxWidth: '300px' }}>
                                {request.repair_details}
                              </div>
                              {request.parts_needed && (
                                <small className="text-muted">
                                  Parts: {request.parts_needed}
                                </small>
                              )}
                            </td>
                            <td>
                              {new Date(request.created_at).toLocaleDateString()}
                              <div className="small text-muted">
                                {new Date(request.created_at).toLocaleTimeString()}
                              </div>
                            </td>
                            <td>
                              <StatusBadge status={request.status} />
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => window.print()}
                                >
                                  <FaPrint />
                                </Button>
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                >
                                  <FaDownload />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
                
                {filteredRepairs.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="text-muted">
                      Showing {filteredRepairs.length} of {repairRequests.length} requests
                    </div>
                    <div>
                      <Button variant="light" size="sm" className="me-2">
                        <FaDownload className="me-1" /> Export
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Vehicles Under Repair */}
        <Row className="mt-4">
          <Col md={6}>
            <Card className="custom-card">
              <Card.Header>
                <h5 className="mb-0">Vehicles Currently Under Repair</h5>
              </Card.Header>
              <Card.Body>
                <ul className="list-group list-group-flush">
                  {vehicles
                    .filter(v => v.current_status === 'under_repair')
                    .slice(0, 5)
                    .map(vehicle => (
                      <li key={vehicle.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{vehicle.registration_number}</strong>
                          <div className="small text-muted">{vehicle.vehicle_type}</div>
                        </div>
                        <Badge bg="warning">Under Repair</Badge>
                      </li>
                    ))}
                  
                  {vehicles.filter(v => v.current_status === 'under_repair').length === 0 && (
                    <li className="list-group-item text-center text-muted py-3">
                      No vehicles under repair
                    </li>
                  )}
                </ul>
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
                  <Button variant="outline-primary" className="text-start">
                    <FaFileAlt className="me-2" /> View All Vehicles
                  </Button>
                  <Button variant="outline-success" className="text-start">
                    <FaDownload className="me-2" /> Download Reports
                  </Button>
                  <Button variant="outline-info" className="text-start">
                    <FaTools className="me-2" /> Repair History
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Create Repair Request Modal */}
      <Modal 
        show={showForm} 
        onHide={() => {
          setShowForm(false);
          resetForm();
        }}
        size="lg"
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Repair Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Vehicle Registration Number *</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({
                        ...formData,
                        registration_number: e.target.value
                      })}
                      placeholder="Enter vehicle registration number"
                      className="custom-form-control"
                      required
                    />
                    <Button 
                      variant="primary" 
                      onClick={searchVehicle}
                      disabled={searching || !formData.registration_number.trim()}
                    >
                      {searching ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Searching...
                        </>
                      ) : (
                        <>
                          <FaSearch className="me-2" /> Search
                        </>
                      )}
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            {searchedVehicle && (
              <Alert variant="success" className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Vehicle Found</h6>
                    <p className="mb-0">
                      <strong>{searchedVehicle.registration_number}</strong> • {searchedVehicle.vehicle_type}
                    </p>
                    <p className="mb-0">
                      <small>{searchedVehicle.hospital_name}</small>
                    </p>
                  </div>
                  <StatusBadge status={searchedVehicle.current_status} type="vehicle" />
                </div>
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Repair Details *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.repair_details}
                onChange={(e) => setFormData({
                  ...formData,
                  repair_details: e.target.value
                })}
                placeholder="Describe the repair needed in detail..."
                className="custom-form-control"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estimated Cost (LKR)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({
                      ...formData,
                      estimated_cost: e.target.value
                    })}
                    placeholder="Enter estimated cost"
                    className="custom-form-control"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Parts Needed</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.parts_needed}
                    onChange={(e) => setFormData({
                      ...formData,
                      parts_needed: e.target.value
                    })}
                    placeholder="List required parts"
                    className="custom-form-control"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Engineer Signature</Form.Label>
              <Form.Control
                type="text"
                value={user?.name}
                readOnly
                className="custom-form-control"
              />
              <Form.Text className="text-muted">
                This will be recorded as your digital signature
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="btn-custom"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={!searchedVehicle || !formData.repair_details.trim()}
                className="btn-custom btn-custom-primary"
              >
                <FaPlus className="me-2" /> Submit Request
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default EngineerDashboard;