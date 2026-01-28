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
  Dropdown,
  ProgressBar
} from 'react-bootstrap';
import {
  FaForward,
  FaSearch,
  FaCar,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaFilter,
  FaClock,
  FaPaperPlane,
  FaHistory,
  FaChartLine,
  FaExclamationTriangle,
  FaUserCheck
} from 'react-icons/fa';
import { repairAPI, vehicleAPI } from '../services/api';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';

function OfficerDashboard() {
  const [user, setUser] = useState(null);
  const [repairRequests, setRepairRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comments, setComments] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    forwarded: 0,
    total: 0
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.role !== 'subject_officer') {
      window.location.href = '/login';
      return;
    }
    setUser(storedUser);
    fetchDashboardData();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, statusFilter, repairRequests]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await repairAPI.getAll();
      const requests = response.data.data;
      
      setRepairRequests(requests);
      setFilteredRequests(requests.filter(req => req.status === 'pending'));
      
      // Calculate stats
      const pendingCount = requests.filter(req => req.status === 'pending').length;
      const forwardedCount = requests.filter(req => req.status === 'sent_to_rdhs').length;
      
      setStats({
        pending: pendingCount,
        forwarded: forwardedCount,
        total: requests.length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = repairRequests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.engineer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleForwardClick = (request) => {
    setSelectedRequest(request);
    setShowForwardModal(true);
  };

  const handleForwardConfirm = async () => {
    if (!selectedRequest) return;

    try {
      await repairAPI.updateStatus(selectedRequest.id, {
        status: 'sent_to_rdhs',
        officer_id: user.id,
        comments: comments
      });

      setSuccess(`Request #${selectedRequest.id} forwarded to RDHS successfully!`);
      setShowForwardModal(false);
      setSelectedRequest(null);
      setComments('');
      
      // Refresh data
      fetchDashboardData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to forward request');
    }
  };

  const viewRequestDetails = (request) => {
    // In a real app, you might navigate to a details page
    alert(`Details for Request #${request.id}\n\nVehicle: ${request.registration_number}\nType: ${request.vehicle_type}\nHospital: ${request.hospital_name}\nRepair Details: ${request.repair_details}\nEngineer: ${request.engineer_name}\nStatus: ${request.status}`);
  };

  const getRequestHistory = async (requestId) => {
    try {
      const response = await repairAPI.getById(requestId);
      const history = response.data.data.history;
      
      if (history && history.length > 0) {
        const historyText = history.map(h => 
          `${new Date(h.updated_at).toLocaleString()}: ${h.status.toUpperCase()} by ${h.officer_name} (${h.officer_role})\nComments: ${h.comments || 'None'}`
        ).join('\n\n');
        
        alert(`History for Request #${requestId}\n\n${historyText}`);
      } else {
        alert('No history found for this request');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const getStatusStats = () => {
    const statusCounts = {
      pending: 0,
      sent_to_rdhs: 0,
      approved: 0,
      rejected: 0
    };

    repairRequests.forEach(request => {
      if (statusCounts[request.status] !== undefined) {
        statusCounts[request.status]++;
      }
    });

    return statusCounts;
  };

  const statusStats = getStatusStats();

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
            <FaTimesCircle className="me-2" /> {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-warning">
                  <FaClock />
                </div>
                <div className="stats-value">{stats.pending}</div>
                <div className="stats-label">Pending Review</div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-info">
                  <FaPaperPlane />
                </div>
                <div className="stats-value">{stats.forwarded}</div>
                <div className="stats-label">Forwarded</div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-success">
                  <FaCheckCircle />
                </div>
                <div className="stats-value">{statusStats.approved}</div>
                <div className="stats-label">Approved</div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-danger">
                  <FaTimesCircle />
                </div>
                <div className="stats-value">{statusStats.rejected}</div>
                <div className="stats-label">Rejected</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Status Distribution */}
        <Row className="mb-4">
          <Col>
            <Card className="custom-card">
              <Card.Header>
                <h5 className="mb-0">Status Distribution</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {Object.entries(statusStats).map(([status, count]) => (
                    <Col key={status} md={3} className="mb-3">
                      <div className="d-flex align-items-center">
                        <StatusBadge status={status} />
                        <span className="ms-2 fw-bold">{count}</span>
                      </div>
                      <ProgressBar 
                        now={repairRequests.length > 0 ? (count / repairRequests.length) * 100 : 0}
                        className="mt-1"
                        variant={status === 'pending' ? 'warning' : 
                                status === 'sent_to_rdhs' ? 'info' :
                                status === 'approved' ? 'success' : 'danger'}
                      />
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters and Search */}
        <Row className="mb-4">
          <Col>
            <Card className="custom-card">
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <InputGroup>
                      <FormControl
                        placeholder="Search by vehicle number, hospital, or engineer..."
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
                        <option value="pending">Pending Review</option>
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
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Repair Requests for Review</h5>
                  <Badge bg="primary">{filteredRequests.length} requests</Badge>
                </div>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <LoadingSpinner />
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-5">
                    <FaCheckCircle size={48} className="text-muted mb-3" />
                    <h4>No requests found</h4>
                    <p className="text-muted">
                      {statusFilter === 'pending' 
                        ? 'All pending requests have been reviewed!' 
                        : 'No requests match your filters'}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="custom-table">
                      <thead>
                        <tr>
                          <th>Request ID</th>
                          <th>Vehicle Details</th>
                          <th>Hospital</th>
                          <th>Engineer</th>
                          <th>Repair Details</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((request) => (
                          <tr key={request.id}>
                            <td>
                              <strong>#{request.id}</strong>
                            </td>
                            <td>
                              <div>
                                <strong>{request.registration_number}</strong>
                                <div className="text-muted small">
                                  {request.vehicle_type}
                                </div>
                              </div>
                            </td>
                            <td>{request.hospital_name}</td>
                            <td>
                              <div className="small">
                                {request.engineer_name}
                                <div className="text-muted">{request.engineer_email}</div>
                              </div>
                            </td>
                            <td>
                              <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                {request.repair_details}
                              </div>
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
                                  onClick={() => viewRequestDetails(request)}
                                  title="View Details"
                                >
                                  <FaEye />
                                </Button>
                                
                                {request.status === 'pending' && (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleForwardClick(request)}
                                    title="Forward to RDHS"
                                  >
                                    <FaForward />
                                  </Button>
                                )}
                                
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => getRequestHistory(request.id)}
                                  title="View History"
                                >
                                  <FaHistory />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
                
                {filteredRequests.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="text-muted">
                      Showing {filteredRequests.length} of {repairRequests.length} total requests
                    </div>
                    <div className="small text-muted">
                      Last updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions and Recent Activity */}
        <Row className="mt-4">
          <Col lg={8}>
            <Card className="custom-card">
              <Card.Header>
                <h5 className="mb-0">Recent Forwarded Requests</h5>
              </Card.Header>
              <Card.Body>
                <ul className="list-group list-group-flush">
                  {repairRequests
                    .filter(req => req.status === 'sent_to_rdhs')
                    .slice(0, 5)
                    .map(request => (
                      <li key={request.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>#{request.id}</strong> - {request.registration_number}
                          <div className="small text-muted">
                            Forwarded on {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <StatusBadge status={request.status} />
                      </li>
                    ))}
                  
                  {repairRequests.filter(req => req.status === 'sent_to_rdhs').length === 0 && (
                    <li className="list-group-item text-center text-muted py-3">
                      <FaPaperPlane className="me-2" />
                      No requests forwarded yet
                    </li>
                  )}
                </ul>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="custom-card">
              <Card.Header>
                <h5 className="mb-0">Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    className="text-start d-flex align-items-center"
                    onClick={() => setStatusFilter('pending')}
                  >
                    <FaClock className="me-2" /> View Pending Requests
                  </Button>
                  <Button 
                    variant="success" 
                    className="text-start d-flex align-items-center"
                  >
                    <FaChartLine className="me-2" /> Generate Report
                  </Button>
                  <Button 
                    variant="info" 
                    className="text-start d-flex align-items-center"
                  >
                    <FaUserCheck className="me-2" /> View Engineers
                  </Button>
                  <Button 
                    variant="warning" 
                    className="text-start d-flex align-items-center"
                  >
                    <FaExclamationTriangle className="me-2" /> Urgent Requests
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Forward Modal */}
      <Modal
        show={showForwardModal}
        onHide={() => {
          setShowForwardModal(false);
          setSelectedRequest(null);
          setComments('');
        }}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Forward to RDHS</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <Alert variant="info">
                <div className="d-flex align-items-center">
                  <FaCar className="me-2" />
                  <div>
                    <strong>{selectedRequest.registration_number}</strong>
                    <div className="small">
                      {selectedRequest.vehicle_type} • {selectedRequest.hospital_name}
                    </div>
                  </div>
                </div>
              </Alert>
              
              <div className="mb-3">
                <strong>Repair Details:</strong>
                <p className="mt-1">{selectedRequest.repair_details}</p>
              </div>
              
              <div className="mb-3">
                <strong>Engineer:</strong>
                <p className="mt-1">{selectedRequest.engineer_name}</p>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Comments (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any additional comments for RDHS..."
                  className="custom-form-control"
                />
                <Form.Text className="text-muted">
                  These comments will be visible to RDHS
                </Form.Text>
              </Form.Group>
              
              <div className="alert alert-warning">
                <FaExclamationTriangle className="me-2" />
                Are you sure you want to forward this request to RDHS for final approval?
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowForwardModal(false);
              setSelectedRequest(null);
              setComments('');
            }}
            className="btn-custom"
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleForwardConfirm}
            className="btn-custom btn-custom-success"
          >
            <FaPaperPlane className="me-2" /> Confirm Forward
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default OfficerDashboard;