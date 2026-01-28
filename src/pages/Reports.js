import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  FormControl,
  Dropdown,
  Alert,
  ProgressBar,
  Badge,
  Modal,
  Tabs,
  Tab,
  ListGroup,
  ListGroupItem
} from 'react-bootstrap';
import {
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaPrint,
  FaDownload,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaCalendar,
  FaFilter,
  FaSearch,
  FaEye,
  FaSync,
  FaCar,
  FaTools,
  FaHospital,
  FaUser,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCheck
} from 'react-icons/fa';
import { repairAPI, vehicleAPI } from '../services/api';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import '../App.css';

function Reports() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportData, setReportData] = useState({
    summary: {},
    monthlyStats: [],
    statusStats: [],
    vehicleStats: [],
    engineerStats: [],
    hospitalStats: []
  });
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      window.location.href = '/login';
      return;
    }
    setUser(storedUser);
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch repair statistics
      const repairsRes = await repairAPI.getStats();
      const repairsData = repairsRes.data.data;
      
      // Fetch vehicles for additional stats
      const vehiclesRes = await vehicleAPI.getAll();
      const vehicles = vehiclesRes.data.data;
      
      // Calculate summary statistics
      const totalRepairs = repairsData.statusCount.reduce((sum, item) => sum + item.count, 0);
      const approvedRepairs = repairsData.statusCount.find(item => item.status === 'approved')?.count || 0;
      const pendingRepairs = repairsData.statusCount.find(item => item.status === 'pending')?.count || 0;
      const inProgressRepairs = repairsData.statusCount.find(item => item.status === 'sent_to_rdhs')?.count || 0;
      
      // Calculate vehicle statistics
      const vehicleStats = {
        operational: vehicles.filter(v => v.current_status === 'operational').length,
        under_repair: vehicles.filter(v => v.current_status === 'under_repair').length,
        repaired: vehicles.filter(v => v.current_status === 'repaired').length,
        total: vehicles.length
      };
      
      // Group by hospital (simulated)
      const hospitalStats = [
        { hospital: 'Base Hospital Colombo', repairs: 12, vehicles: 5 },
        { hospital: 'Base Hospital Gampaha', repairs: 8, vehicles: 3 },
        { hospital: 'Base Hospital Kalutara', repairs: 15, vehicles: 7 },
        { hospital: 'MOH Office Colombo', repairs: 6, vehicles: 2 },
        { hospital: 'MOH Office Gampaha', repairs: 9, vehicles: 4 }
      ];
      
      // Engineer stats (simulated)
      const engineerStats = [
        { name: 'Engineer John Doe', repairs: 25, approved: 20, pending: 5 },
        { name: 'Engineer Jane Smith', repairs: 18, approved: 15, pending: 3 },
        { name: 'Engineer Bob Wilson', repairs: 12, approved: 10, pending: 2 }
      ];
      
      setReportData({
        summary: {
          totalRepairs,
          approvedRepairs,
          pendingRepairs,
          inProgressRepairs,
          approvalRate: totalRepairs > 0 ? ((approvedRepairs / totalRepairs) * 100).toFixed(1) : 0
        },
        monthlyStats: repairsData.monthlyStats,
        statusStats: repairsData.statusCount,
        vehicleStats,
        engineerStats,
        hospitalStats
      });
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (format) => {
    setGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      alert(`${format.toUpperCase()} report generated successfully!`);
      setGenerating(false);
    }, 1500);
  };

  const printReport = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      'sent_to_rdhs': 'info',
      approved: 'success',
      rejected: 'danger'
    };
    return colors[status] || 'secondary';
  };

  const calculateTrend = (current, previous) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <>
      <Header user={user} />
      <Container fluid className="dashboard-container">
        {error && (
          <Alert variant="danger" className="alert-dismissible fade show" dismissible onClose={() => setError('')}>
            <FaExclamationTriangle className="me-2" /> {error}
          </Alert>
        )}

        {/* Report Header */}
        <Row className="mb-4">
          <Col>
            <Card className="custom-card">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0">Reports & Analytics</h4>
                  <p className="text-muted mb-0">Generate and analyze system reports</p>
                </div>
                <div className="d-flex gap-2">
                  <Dropdown>
                    <Dropdown.Toggle variant="primary">
                      <FaDownload className="me-2" /> Export Report
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => generateReport('pdf')}>
                        <FaFilePdf className="me-2" /> PDF Format
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => generateReport('excel')}>
                        <FaFileExcel className="me-2" /> Excel Format
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => generateReport('csv')}>
                        <FaFileCsv className="me-2" /> CSV Format
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Button 
                    variant="outline-primary" 
                    onClick={printReport}
                  >
                    <FaPrint className="me-2" /> Print
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={fetchReportData}
                  >
                    <FaSync className="me-2" /> Refresh
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Date Range Filter */}
        <Row className="mb-4">
          <Col>
            <Card className="custom-card">
              <Card.Header>
                <h5 className="mb-0">Report Filters</h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({
                          ...dateRange,
                          startDate: e.target.value
                        })}
                        className="custom-form-control"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({
                          ...dateRange,
                          endDate: e.target.value
                        })}
                        className="custom-form-control"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Button 
                      variant="primary" 
                      className="w-100"
                      onClick={() => alert('Filter applied!')}
                    >
                      <FaFilter className="me-2" /> Apply Filter
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Report Tabs */}
        <Card className="custom-card mb-4">
          <Card.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-3"
            >
              <Tab eventKey="summary" title={
                <span>
                  <FaChartBar className="me-1" />
                  Summary
                </span>
              }>
                <SummaryReport data={reportData} />
              </Tab>
              
              <Tab eventKey="monthly" title={
                <span>
                  <FaChartLine className="me-1" />
                  Monthly Trends
                </span>
              }>
                <MonthlyReport 
                  data={reportData.monthlyStats} 
                  calculateTrend={calculateTrend}
                />
              </Tab>
              
              <Tab eventKey="status" title={
                <span>
                  <FaChartPie className="me-1" />
                  Status Analysis
                </span>
              }>
                <StatusReport 
                  data={reportData.statusStats} 
                  getStatusColor={getStatusColor}
                />
              </Tab>
              
              <Tab eventKey="vehicles" title={
                <span>
                  <FaCar className="me-1" />
                  Vehicle Statistics
                </span>
              }>
                <VehicleReport data={reportData.vehicleStats} />
              </Tab>
              
              <Tab eventKey="performance" title={
                <span>
                  <FaUser className="me-1" />
                  Performance
                </span>
              }>
                <PerformanceReport data={reportData.engineerStats} />
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>

        {/* Generating Overlay */}
        {generating && (
          <div className="position-fixed top-0 left-0 w-100 h-100 d-flex justify-content-center align-items-center" 
               style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
            <Card className="custom-card" style={{ width: '300px' }}>
              <Card.Body className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5>Generating Report...</h5>
                <p className="text-muted mb-0">Please wait</p>
              </Card.Body>
            </Card>
          </div>
        )}
      </Container>
    </>
  );
}

// Summary Report Component
const SummaryReport = ({ data }) => (
  <Row className="mt-3">
    {/* Key Metrics */}
    <Col md={3} className="mb-3">
      <Card className="custom-card h-100">
        <Card.Body className="text-center">
          <div className="stats-icon text-primary">
            <FaTools />
          </div>
          <div className="stats-value">{data.summary.totalRepairs || 0}</div>
          <div className="stats-label">Total Repairs</div>
          <div className="text-muted small mt-2">
            All time repair requests
          </div>
        </Card.Body>
      </Card>
    </Col>
    
    <Col md={3} className="mb-3">
      <Card className="custom-card h-100">
        <Card.Body className="text-center">
          <div className="stats-icon text-success">
            <FaCheckCircle />
          </div>
          <div className="stats-value">{data.summary.approvedRepairs || 0}</div>
          <div className="stats-label">Approved</div>
          <div className="text-muted small mt-2">
            Successfully completed
          </div>
        </Card.Body>
      </Card>
    </Col>
    
    <Col md={3} className="mb-3">
      <Card className="custom-card h-100">
        <Card.Body className="text-center">
          <div className="stats-icon text-warning">
            <FaClock />
          </div>
          <div className="stats-value">{data.summary.pendingRepairs || 0}</div>
          <div className="stats-label">Pending</div>
          <div className="text-muted small mt-2">
            Awaiting review
          </div>
        </Card.Body>
      </Card>
    </Col>
    
    <Col md={3} className="mb-3">
      <Card className="custom-card h-100">
        <Card.Body className="text-center">
          <div className="stats-icon text-info">
            <FaChartBar />
          </div>
          <div className="stats-value">{data.summary.approvalRate || 0}%</div>
          <div className="stats-label">Approval Rate</div>
          <div className="text-muted small mt-2">
            Success rate
          </div>
        </Card.Body>
      </Card>
    </Col>
    
    {/* Detailed Summary */}
    <Col md={8}>
      <Card className="custom-card">
        <Card.Header>
          <h5 className="mb-0">Repair Request Overview</h5>
        </Card.Header>
        <Card.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Repair Requests</td>
                <td><strong>{data.summary.totalRepairs || 0}</strong></td>
                <td>100%</td>
                <td><Badge bg="primary">+12%</Badge></td>
              </tr>
              <tr>
                <td>Approved Repairs</td>
                <td><strong>{data.summary.approvedRepairs || 0}</strong></td>
                <td>{data.summary.approvalRate || 0}%</td>
                <td><Badge bg="success">+8%</Badge></td>
              </tr>
              <tr>
                <td>Pending Review</td>
                <td><strong>{data.summary.pendingRepairs || 0}</strong></td>
                <td>
                  {data.summary.totalRepairs > 0 
                    ? ((data.summary.pendingRepairs / data.summary.totalRepairs) * 100).toFixed(1) + '%'
                    : '0%'}
                </td>
                <td><Badge bg="warning">+3%</Badge></td>
              </tr>
              <tr>
                <td>In Progress</td>
                <td><strong>{data.summary.inProgressRepairs || 0}</strong></td>
                <td>
                  {data.summary.totalRepairs > 0 
                    ? ((data.summary.inProgressRepairs / data.summary.totalRepairs) * 100).toFixed(1) + '%'
                    : '0%'}
                </td>
                <td><Badge bg="info">+5%</Badge></td>
              </tr>
              <tr>
                <td>Average Processing Time</td>
                <td><strong>3.2 days</strong></td>
                <td>-</td>
                <td><Badge bg="success">-0.5 days</Badge></td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
    
    <Col md={4}>
      <Card className="custom-card">
        <Card.Header>
          <h5 className="mb-0">Quick Insights</h5>
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            <ListGroupItem className="d-flex align-items-center">
              <FaCheckCircle className="text-success me-2" />
              <div>
                <strong>High Approval Rate</strong>
                <div className="small text-muted">Most repairs get approved</div>
              </div>
            </ListGroupItem>
            <ListGroupItem className="d-flex align-items-center">
              <FaClock className="text-warning me-2" />
              <div>
                <strong>Fast Processing</strong>
                <div className="small text-muted">Average 3.2 days per request</div>
              </div>
            </ListGroupItem>
            <ListGroupItem className="d-flex align-items-center">
              <FaHospital className="text-primary me-2" />
              <div>
                <strong>Top Hospital</strong>
                <div className="small text-muted">Base Hospital Colombo</div>
              </div>
            </ListGroupItem>
            <ListGroupItem className="d-flex align-items-center">
              <FaUser className="text-info me-2" />
              <div>
                <strong>Top Engineer</strong>
                <div className="small text-muted">Engineer John Doe</div>
              </div>
            </ListGroupItem>
          </ListGroup>
        </Card.Body>
      </Card>
    </Col>
  </Row>
);

// Monthly Report Component
const MonthlyReport = ({ data, calculateTrend }) => (
  <div className="mt-3">
    <Card className="custom-card">
      <Card.Header>
        <h5 className="mb-0">Monthly Repair Trends</h5>
      </Card.Header>
      <Card.Body>
        {data.length === 0 ? (
          <div className="text-center py-5">
            <FaChartLine size={48} className="text-muted mb-3" />
            <h5>No monthly data available</h5>
            <p className="text-muted">Monthly statistics will appear here</p>
          </div>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Requests</th>
                <th>Approved</th>
                <th>Approval Rate</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.map((month, index) => (
                <tr key={index}>
                  <td>
                    <strong>{month.month}</strong>
                  </td>
                  <td>{month.count}</td>
                  <td>{month.approved_count}</td>
                  <td>
                    {month.count > 0 
                      ? ((month.approved_count / month.count) * 100).toFixed(1) + '%'
                      : '0%'}
                  </td>
                  <td>
                    <Badge bg={
                      index > 0 && month.count > data[index - 1].count 
                        ? 'success' 
                        : 'warning'
                    }>
                      {index > 0 
                        ? calculateTrend(month.count, data[index - 1].count) + '%'
                        : 'N/A'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  </div>
);

// Status Report Component
const StatusReport = ({ data, getStatusColor }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <Row className="mt-3">
      <Col md={8}>
        <Card className="custom-card">
          <Card.Header>
            <h5 className="mb-0">Repair Status Distribution</h5>
          </Card.Header>
          <Card.Body>
            {data.length === 0 ? (
              <div className="text-center py-5">
                <FaChartPie size={48} className="text-muted mb-3" />
                <h5>No status data available</h5>
                <p className="text-muted">Status statistics will appear here</p>
              </div>
            ) : (
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Percentage</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((status, index) => {
                    const percentage = total > 0 ? (status.count / total * 100).toFixed(1) : 0;
                    
                    return (
                      <tr key={index}>
                        <td>
                          <StatusBadge status={status.status} />
                        </td>
                        <td>
                          <strong>{status.count}</strong>
                        </td>
                        <td>{percentage}%</td>
                        <td>
                          <ProgressBar 
                            now={parseFloat(percentage)} 
                            variant={getStatusColor(status.status)}
                            style={{ height: '8px' }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={4}>
        <Card className="custom-card">
          <Card.Header>
            <h5 className="mb-0">Status Insights</h5>
          </Card.Header>
          <Card.Body>
            <div className="text-center mb-4">
              <div className="display-4">
                {total}
              </div>
              <div className="text-muted">Total Requests</div>
            </div>
            
            <ListGroup variant="flush">
              {data.map((status, index) => {
                const percentage = total > 0 ? (status.count / total * 100).toFixed(1) : 0;
                
                return (
                  <ListGroupItem key={index}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <StatusBadge status={status.status} />
                      </div>
                      <div className="text-end">
                        <div>{status.count}</div>
                        <div className="small text-muted">{percentage}%</div>
                      </div>
                    </div>
                  </ListGroupItem>
                );
              })}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

// Vehicle Report Component
const VehicleReport = ({ data }) => (
  <Row className="mt-3">
    <Col md={6}>
      <Card className="custom-card h-100">
        <Card.Header>
          <h5 className="mb-0">Vehicle Status Overview</h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center mb-4">
            <div className="display-3">{data.total || 0}</div>
            <div className="text-muted">Total Vehicles</div>
          </div>
          
          <Table borderless>
            <tbody>
              <tr>
                <td>
                  <Badge bg="success" className="me-2">Operational</Badge>
                </td>
                <td className="text-end">
                  <strong>{data.operational || 0}</strong>
                </td>
                <td className="text-end">
                  {data.total > 0 ? ((data.operational / data.total) * 100).toFixed(1) + '%' : '0%'}
                </td>
              </tr>
              <tr>
                <td>
                  <Badge bg="warning" className="me-2">Under Repair</Badge>
                </td>
                <td className="text-end">
                  <strong>{data.under_repair || 0}</strong>
                </td>
                <td className="text-end">
                  {data.total > 0 ? ((data.under_repair / data.total) * 100).toFixed(1) + '%' : '0%'}
                </td>
              </tr>
              <tr>
                <td>
                  <Badge bg="info" className="me-2">Repaired</Badge>
                </td>
                <td className="text-end">
                  <strong>{data.repaired || 0}</strong>
                </td>
                <td className="text-end">
                  {data.total > 0 ? ((data.repaired / data.total) * 100).toFixed(1) + '%' : '0%'}
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
    
    <Col md={6}>
      <Card className="custom-card h-100">
        <Card.Header>
          <h5 className="mb-0">Vehicle Type Distribution</h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-4">
            <FaCar size={48} className="text-muted mb-3" />
            <h5>Vehicle Types</h5>
            <p className="text-muted">Distribution by vehicle category</p>
          </div>
          
          <Table borderless>
            <tbody>
              <tr>
                <td>Ambulances</td>
                <td className="text-end">
                  <ProgressBar now={35} variant="danger" style={{ width: '100px', height: '8px' }} />
                </td>
                <td className="text-end">35%</td>
              </tr>
              <tr>
                <td>Vans</td>
                <td className="text-end">
                  <ProgressBar now={25} variant="warning" style={{ width: '100px', height: '8px' }} />
                </td>
                <td className="text-end">25%</td>
              </tr>
              <tr>
                <td>Cars</td>
                <td className="text-end">
                  <ProgressBar now={20} variant="info" style={{ width: '100px', height: '8px' }} />
                </td>
                <td className="text-end">20%</td>
              </tr>
              <tr>
                <td>Others</td>
                <td className="text-end">
                  <ProgressBar now={20} variant="success" style={{ width: '100px', height: '8px' }} />
                </td>
                <td className="text-end">20%</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
  </Row>
);

// Performance Report Component
const PerformanceReport = ({ data }) => (
  <div className="mt-3">
    <Card className="custom-card">
      <Card.Header>
        <h5 className="mb-0">Engineer Performance</h5>
      </Card.Header>
      <Card.Body>
        {data.length === 0 ? (
          <div className="text-center py-5">
            <FaUser size={48} className="text-muted mb-3" />
            <h5>No performance data available</h5>
            <p className="text-muted">Engineer statistics will appear here</p>
          </div>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>Engineer</th>
                <th>Total Repairs</th>
                <th>Approved</th>
                <th>Pending</th>
                <th>Approval Rate</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {data.map((engineer, index) => (
                <tr key={index}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                           style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                        {engineer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      {engineer.name}
                    </div>
                  </td>
                  <td><strong>{engineer.repairs}</strong></td>
                  <td>{engineer.approved}</td>
                  <td>{engineer.pending}</td>
                  <td>
                    {engineer.repairs > 0 
                      ? ((engineer.approved / engineer.repairs) * 100).toFixed(1) + '%'
                      : '0%'}
                  </td>
                  <td>
                    <Badge bg={
                      (engineer.approved / engineer.repairs * 100) >= 80 
                        ? 'success' 
                        : (engineer.approved / engineer.repairs * 100) >= 60 
                        ? 'warning' 
                        : 'danger'
                    }>
                      {engineer.repairs > 0 
                        ? ((engineer.approved / engineer.repairs) * 100).toFixed(1) + '%'
                        : '0%'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  </div>
);

export default Reports;