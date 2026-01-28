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
  ProgressBar,
  Tabs,
  Tab
} from 'react-bootstrap';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaEye,
  FaHistory,
  FaChartBar,
  FaCar,
  FaHospital,
  FaUser,
  FaCalendar,
  FaMoneyBillWave,
  FaFileInvoice,
  FaExclamationCircle,
  FaCheck,
  FaBan,
  FaFilter,
  FaDownload,
  FaPrint
} from 'react-icons/fa';
import { repairAPI } from '../services/api';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';

function RDSHDashboard() {
  const [user, setUser] = useState(null);
  const [repairRequests, setRepairRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('');
  const [comments, setComments] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('sent_to_rdhs');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.role !== 'rdhs') {
      window.location.href = '/login';
      return;
    }
    setUser(storedUser);
    fetchDashboardData();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, statusFilter, repairRequests, activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await repairAPI.getAll();
      const requests = response.data.data;
      
      setRepairRequests(requests);
      
      // Calculate stats
      const pendingCount = requests.filter(req => req.status === 'sent_to_rdhs').length;
      const approvedCount = requests.filter(req => req.status === 'approved').length;
      const rejectedCount = requests.filter(req => req.status === 'rejected').length;
      
      setStats({
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: requests.length
      });
      
      // Set initial filtered requests
      filterRequests();
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = repairRequests;

    // Filter by active tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(req => req.status === 'sent_to_rdhs');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(req => req.status === 'approved');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(req => req.status === 'rejected');
    }

    // Additional search filter
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

  const handleActionClick = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setShowActionModal(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      await repairAPI.updateStatus(selectedRequest.id, {
        status: actionType,
        officer_id: user.id,
        comments: comments
      });

      setSuccess(`Request #${selectedRequest.id} ${actionType} successfully!`);
      setShowActionModal(false);
      setSelectedRequest(null);
      setActionType('');
      setComments('');
      
      // Refresh data
      fetchDashboardData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || `Failed to ${actionType} request`);
    }
  };

  const viewRequestDetails = (request) => {
    Modal.info({
      title: `Request Details #${request.id}`,
      width: 800,
      content: (
        <div className="p-3">
          <Row>
            <Col md={6}>
              <h6>Vehicle Information</h6>
              <div className="mb-3">
                <strong>Registration Number:</strong> {request.registration_number}
              </div>
              <div className="mb-3">
                <strong>Vehicle Type:</strong> {request.vehicle_type}
              </div>
              <div className="mb-3">
                <strong>Hospital:</strong> {request.hospital_name}
              </div>
              <div className="mb-3">
                <strong>Current Status:</strong> <StatusBadge status={request.vehicle_status} type="vehicle" />
              </div>
            </Col>
            <Col md={6}>
              <h6>Repair Information</h6>
              <div className="mb-3">
                <strong>Engineer:</strong> {request.engineer_name}
              </div>
              <div className="mb-3">
                <strong>Inspection Date:</strong> {new Date(request.inspection_date).toLocaleDateString()}
              </div>
              <div className="mb-3">
                <strong>Request Status:</strong> <StatusBadge status={request.status} />
              </div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <h6>Repair Details</h6>
              <div className="border p-3 rounded bg-light">
                {request.repair_details}
              </div>
            </Col>
          </Row>
        </div>
      ),
      onOk() {}
    });
  };

  const getRequestHistory = async (requestId) => {
    try {
      const response = await repairAPI.getById(requestId);
      const history = response.data.data.history;
      
      if (history && history.length > 0) {
        Modal.info({
          title: `History for Request #${requestId}`,
          width: 600,
          content: (
            <div className="p-3">
              {history.map((h, index) => (
                <div key={index} className="mb-3 pb-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{h.status.toUpperCase()}</strong>
                      <div className="small text-muted">
                        by {h.officer_name} ({h.officer_role})
                      </div>
                    </div>
                    <div className="small text-muted">
                      {new Date(h.updated_at).toLocaleString()}
                    </div>
                  </div>
                  {h.comments && (
                    <div className="mt-2">
                      <strong>Comments:</strong>
                      <p className="mb-0">{h.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ),
          onOk() {}
        });
      } else {
        alert('No history found for this request');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const generateReport = async () => {
    try {
      const response = await repairAPI.getStats();
      const statsData = response.data.data;
      
      Modal.info({
        title: 'Repair Request Statistics Report',
        width: 800,
        content: (
          <div className="p-3">
            <h5>Monthly Statistics</h5>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Requests</th>
                  <th>Approved</th>
                  <th>Approval Rate</th>
                </tr>
              </thead>
              <tbody>
                {statsData.monthlyStats.map((month, index) => (
                  <tr key={index}>
                    <td>{month.month}</td>
                    <td>{month.count}</td>
                    <td>{month.approved_count}</td>
                    <td>
                      {month.count > 0 
                        ? ((month.approved_count / month.count) * 100).toFixed(1) + '%'
                        : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            <h5 className="mt-4">Status Distribution</h5>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {statsData.statusCount.map((status, index) => (
                  <tr key={index}>
                    <td>
                      <StatusBadge status={status.status} />
                    </td>
                    <td>{status.count}</td>
                    <td>
                      {stats.total > 0 
                        ? ((status.count / stats.total) * 100).toFixed(1) + '%'
                        : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ),
        onOk() {}
      });
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

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
                <div className="stats-icon text-info">
                  <FaFileInvoice />
                </div>
                <div className="stats-value">{stats.pending}</div>
                <div className="stats-label">Pending Decisions</div>
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
          
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-danger">
                  <FaTimesCircle />
                </div>
                <div className="stats-value">{stats.rejected}</div>
                <div className="stats-label">Rejected</div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xl={3} lg={6} md={6} sm={12} className="mb-3">
            <Card className="custom-card h-100">
              <Card.Body className="stats-card">
                <div className="stats-icon text-primary">
                  <FaChartBar />
                </div>
                <div className="stats-value">{stats.total}</div>
                <div className="stats-label">Total Requests</div>
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
                  <h5 className="mb-0">Decision Panel</h5>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="success" 
                      className="btn-custom btn-custom-success"
                      onClick={generateReport}
                    >
                      <FaChartBar className="me-2" /> Generate Report
                    </Button>
                    <Button 
                      variant="primary" 
                      className="btn-custom"
                    >
                      <FaDownload className="me-2" /> Export Data
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs for different status */}
        <Card className="custom-card mb-4">
          <Card.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-3"
            >
              <Tab eventKey="pending" title={
                <span>
                  <FaExclamationCircle className="me-1" />
                  Pending Decisions
                  <Badge bg="warning" className="ms-2">{stats.pending}</Badge>
                </span>
              }>
                {/* Pending tab content will be shown in table below */}
              </Tab>
              <Tab eventKey="approved" title={
                <span>
                  <FaCheck className="me-1" />
                  Approved
                  <Badge bg="success" className="ms-2">{stats.approved}</Badge>
                </span>
              }>
                {/* Approved tab content will be shown in table below */}
              </Tab>
              <Tab eventKey="rejected" title={
                <span>
                  <FaBan className="me-1" />
                  Rejected
                  <Badge bg="danger" className="ms-2">{stats.rejected}</Badge>
                </span>
              }>
                {/* Rejected tab content will be shown in table below */}
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>

        {/* Search Bar */}
        <Row className="mb-4">
          <Col>
            <Card className="custom-card">
              <Card.Body>
                <InputGroup>
                  <FormControl
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-form-control"
                  />
                  <Button variant="outline-secondary">
                    <FaSearch />
                  </Button>
                </InputGroup>
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
                  <h5 className="mb-0">
                    {activeTab === 'pending' && 'Requests Awaiting Decision'}
                    {activeTab === 'approved' && 'Approved Requests'}
                    {activeTab === 'rejected' && 'Rejected Requests'}
                  </h5>
                  <Badge bg={
                    activeTab === 'pending' ? 'warning' :
                    activeTab === 'approved' ? 'success' : 'danger'
                  }>
                    {filteredRequests.length} requests
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <LoadingSpinner />
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-5">
                    {activeTab === 'pending' ? (
                      <>
                        <FaCheckCircle size={48} className="text-success mb-3" />
                        <h4>All clear!</h4>
                        <p className="text-muted">
                          No pending requests at the moment.
                        </p>
                      </>
                    ) : (
                      <>
                        <FaFileInvoice size={48} className="text-muted mb-3" />
                        <h4>No requests found</h4>
                        <p className="text-muted">
                          No {activeTab} requests match your search.
                        </p>
                      </>
                    )}
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
                          <th>Date Received</th>
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
                            <td>
                              <div className="small">
                                {request.hospital_name}
                              </div>
                            </td>
                            <td>
                              <div className="small">
                                {request.engineer_name}
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
                                
                                {request.status === 'sent_to_rdhs' && (
                                  <>
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleActionClick(request, 'approved')}
                                      title="Approve Request"
                                    >
                                      <FaCheck />
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleActionClick(request, 'rejected')}
                                      title="Reject Request"
                                    >
                                      <FaTimesCircle />
                                    </Button>
                                  </>
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
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Monthly Stats */}
        <Row className="mt-4">
          <Col>
            <Card className="custom-card">
              <Card.Header>
                <h5 className="mb-0">Approval Statistics</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4} className="text-center">
                    <div className="display-4 text-success">{stats.approved}</div>
                    <div className="text-muted">Approved Requests</div>
                  </Col>
                  <Col md={4} className="text-center">
                    <div className="display-4 text-danger">{stats.rejected}</div>
                    <div className="text-muted">Rejected Requests</div>
                  </Col>
                  <Col md={4} className="text-center">
                    <div className="display-4 text-primary">
                      {stats.total > 0 
                        ? ((stats.approved / stats.total) * 100).toFixed(1) + '%'
                        : '0%'}
                    </div>
                    <div className="text-muted">Approval Rate</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Action Modal */}
      <Modal
        show={showActionModal}
        onHide={() => {
          setShowActionModal(false);
          setSelectedRequest(null);
          setActionType('');
          setComments('');
        }}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'approved' ? 'Approve' : 'Reject'} Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <Alert variant={actionType === 'approved' ? 'success' : 'danger'}>
                <div className="d-flex align-items-center">
                  {actionType === 'approved' ? <FaCheckCircle /> : <FaTimesCircle />}
                  <div className="ms-2">
                    <strong>Request #{selectedRequest.id}</strong>
                    <div>
                      {selectedRequest.registration_number} • {selectedRequest.vehicle_type}
                    </div>
                  </div>
                </div>
              </Alert>
              
              <div className="mb-3">
                <strong>Repair Details:</strong>
                <p className="mt-1 border p-2 rounded bg-light">
                  {selectedRequest.repair_details}
                </p>
              </div>
              
              <div className="mb-3">
                <strong>Hospital:</strong>
                <p className="mt-1">{selectedRequest.hospital_name}</p>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  {actionType === 'approved' 
                    ? 'Approval Comments (Optional)' 
                    : 'Rejection Reason (Required)'}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    actionType === 'approved'
                      ? 'Add comments for approval...'
                      : 'Please provide reason for rejection...'
                  }
                  className="custom-form-control"
                  required={actionType === 'rejected'}
                />
              </Form.Group>
              
              <div className={`alert alert-${actionType === 'approved' ? 'success' : 'danger'}`}>
                {actionType === 'approved' ? (
                  <>
                    <FaCheckCircle className="me-2" />
                    Are you sure you want to approve this repair request?
                    <div className="small mt-1">
                      This will mark the vehicle as repaired and complete the process.
                    </div>
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="me-2" />
                    Are you sure you want to reject this repair request?
                    <div className="small mt-1">
                      The engineer will be notified and may need to re-submit.
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowActionModal(false);
              setSelectedRequest(null);
              setActionType('');
              setComments('');
            }}
            className="btn-custom"
          >
            Cancel
          </Button>
          <Button
            variant={actionType === 'approved' ? 'success' : 'danger'}
            onClick={handleActionConfirm}
            className={`btn-custom btn-custom-${actionType === 'approved' ? 'success' : 'danger'}`}
            disabled={actionType === 'rejected' && !comments.trim()}
          >
            {actionType === 'approved' ? (
              <>
                <FaCheck className="me-2" /> Confirm Approval
              </>
            ) : (
              <>
                <FaTimesCircle className="me-2" /> Confirm Rejection
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RDSHDashboard;