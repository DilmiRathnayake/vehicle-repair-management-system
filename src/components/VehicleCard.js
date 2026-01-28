import React, { useState } from 'react';
import { 
  Card, 
  Badge, 
  Button, 
  Modal, 
  Row, 
  Col,
  ProgressBar,
  Tooltip,
  OverlayTrigger
} from 'react-bootstrap';
import { 
  FaCar, 
  FaHospital, 
  FaTools, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaCalendar,
  FaHistory,
  FaWrench,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaCog
} from 'react-icons/fa';
import StatusBadge from './StatusBadge';
import '../App.css';

const VehicleCard = ({ 
  vehicle, 
  onEdit, 
  onDelete, 
  onViewDetails,
  onRepairRequest,
  showActions = true,
  compact = false
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Calculate days since creation
  const getDaysSince = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      operational: 'success',
      under_repair: 'warning',
      repaired: 'info',
      approved: 'primary'
    };
    return colors[status] || 'secondary';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      operational: <FaCheckCircle className="text-success" />,
      under_repair: <FaTools className="text-warning" />,
      repaired: <FaWrench className="text-info" />,
      approved: <FaCheckCircle className="text-primary" />
    };
    return icons[status] || <FaInfoCircle className="text-secondary" />;
  };

  // Get vehicle type icon
  const getVehicleTypeIcon = (type) => {
    const icons = {
      'Ambulance': '🚑',
      'Van': '🚐',
      'Car': '🚗',
      'Bus': '🚌',
      'Motorcycle': '🏍️',
      'Truck': '🚚',
      'Other': '🚙'
    };
    return icons[type] || '🚗';
  };

  // Get hospital abbreviation
  const getHospitalAbbreviation = (hospitalName) => {
    if (!hospitalName) return 'HOSP';
    const words = hospitalName.split(' ');
    if (words.length >= 2) {
      return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
    }
    return hospitalName.substring(0, 4).toUpperCase();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(vehicle.id);
    }
    setShowDeleteModal(false);
  };

  const handleRepairRequest = () => {
    if (onRepairRequest) {
      onRepairRequest(vehicle);
    }
  };

  // Status descriptions
  const getStatusDescription = (status) => {
    const descriptions = {
      operational: 'Vehicle is fully operational and ready for service',
      under_repair: 'Vehicle is currently undergoing repairs',
      repaired: 'Repairs completed, awaiting final approval',
      approved: 'Repairs approved, vehicle back in service'
    };
    return descriptions[status] || 'Status unknown';
  };

  if (compact) {
    return (
      <Card className="custom-card h-100">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                   style={{ width: '48px', height: '48px', fontSize: '20px' }}>
                {getVehicleTypeIcon(vehicle.vehicle_type)}
              </div>
              <div>
                <h6 className="mb-1">{vehicle.registration_number}</h6>
                <div className="small text-muted">
                  {vehicle.vehicle_type}
                </div>
              </div>
            </div>
            <StatusBadge status={vehicle.current_status} type="vehicle" />
          </div>
          
          {showActions && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => onViewDetails && onViewDetails(vehicle)}
              >
                <FaEye />
              </Button>
              <Button 
                variant="outline-warning" 
                size="sm"
                onClick={() => onEdit && onEdit(vehicle)}
              >
                <FaEdit />
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <FaTrash />
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="custom-card h-100">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                 style={{ width: '36px', height: '36px', fontSize: '16px' }}>
              {getVehicleTypeIcon(vehicle.vehicle_type)}
            </div>
            <div>
              <h5 className="mb-0">{vehicle.registration_number}</h5>
              <small className="text-muted">{vehicle.vehicle_type}</small>
            </div>
          </div>
          <StatusBadge status={vehicle.current_status} type="vehicle" />
        </Card.Header>
        
        <Card.Body>
          {/* Hospital Info */}
          <div className="d-flex align-items-center mb-3">
            <FaHospital className="text-muted me-2" />
            <div>
              <div className="small text-muted">Hospital</div>
              <strong>{vehicle.hospital_name || 'Not specified'}</strong>
            </div>
          </div>

          {/* Status with progress bar */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted">Status</span>
              <span className="small">
                {getStatusIcon(vehicle.current_status)}
              </span>
            </div>
            <ProgressBar 
              now={
                vehicle.current_status === 'operational' ? 100 :
                vehicle.current_status === 'under_repair' ? 50 :
                vehicle.current_status === 'repaired' ? 75 : 100
              }
              variant={getStatusColor(vehicle.current_status)}
              className="mb-2"
              style={{ height: '6px' }}
            />
            <div className="small text-muted">
              {getStatusDescription(vehicle.current_status)}
            </div>
          </div>

          {/* Additional Info */}
          <Row className="g-2 mb-3">
            <Col xs={6}>
              <div className="border rounded p-2 text-center">
                <div className="small text-muted">Days Active</div>
                <div className="h5 mb-0">{getDaysSince(vehicle.created_at)}</div>
              </div>
            </Col>
            <Col xs={6}>
              <div className="border rounded p-2 text-center">
                <div className="small text-muted">Last Updated</div>
                <div className="small">
                  {new Date(vehicle.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </Col>
          </Row>

          {/* Quick Info */}
          <div className="border-top pt-3">
            <div className="small text-muted mb-2">Quick Info</div>
            <div className="d-flex justify-content-between">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Vehicle ID</Tooltip>}
              >
                <span className="badge bg-light text-dark">#{vehicle.id}</span>
              </OverlayTrigger>
              
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Hospital Code</Tooltip>}
              >
                <span className="badge bg-light text-dark">
                  <FaMapMarkerAlt className="me-1" />
                  {getHospitalAbbreviation(vehicle.hospital_name)}
                </span>
              </OverlayTrigger>
              
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Added Date</Tooltip>}
              >
                <span className="badge bg-light text-dark">
                  <FaCalendar className="me-1" />
                  {new Date(vehicle.created_at).getFullYear()}
                </span>
              </OverlayTrigger>
            </div>
          </div>
        </Card.Body>
        
        {showActions && (
          <Card.Footer className="bg-transparent border-top-0">
            <div className="d-flex justify-content-between">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowDetailsModal(true)}
                className="d-flex align-items-center"
              >
                <FaEye className="me-1" /> Details
              </Button>
              
              {vehicle.current_status === 'operational' && (
                <Button 
                  variant="warning" 
                  size="sm"
                  onClick={handleRepairRequest}
                  className="d-flex align-items-center"
                >
                  <FaTools className="me-1" /> Repair
                </Button>
              )}
              
              <div className="dropdown">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  className="dropdown-toggle"
                  id={`dropdown-${vehicle.id}`}
                  data-bs-toggle="dropdown"
                >
                  <FaCog />
                </Button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => onEdit && onEdit(vehicle)}
                    >
                      <FaEdit className="me-2" /> Edit Vehicle
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={() => onViewDetails && onViewDetails(vehicle)}
                    >
                      <FaHistory className="me-2" /> View History
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <FaTrash className="me-2" /> Delete Vehicle
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        centered
        size="lg"
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '48px', height: '48px', fontSize: '24px' }}>
              {getVehicleTypeIcon(vehicle.vehicle_type)}
            </div>
            <div>
              {vehicle.registration_number}
              <div className="small text-muted">{vehicle.vehicle_type}</div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <div className="mb-4">
                <h6 className="text-muted mb-3">Basic Information</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td className="text-muted">Registration No:</td>
                      <td><strong>{vehicle.registration_number}</strong></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Vehicle Type:</td>
                      <td>{vehicle.vehicle_type}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Hospital:</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaHospital className="text-muted me-2" />
                          {vehicle.hospital_name}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Current Status:</td>
                      <td>
                        <StatusBadge status={vehicle.current_status} type="vehicle" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
            
            <Col md={6}>
              <div className="mb-4">
                <h6 className="text-muted mb-3">Timeline</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td className="text-muted">Added Date:</td>
                      <td>
                        {new Date(vehicle.created_at).toLocaleDateString()}
                        <div className="small text-muted">
                          ({getDaysSince(vehicle.created_at)} days ago)
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Last Updated:</td>
                      <td>
                        {new Date(vehicle.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Vehicle ID:</td>
                      <td><code>#{vehicle.id}</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
          
          {/* Status Information */}
          <div className="mt-4 p-3 border rounded bg-light">
            <div className="d-flex align-items-center mb-2">
              {getStatusIcon(vehicle.current_status)}
              <h6 className="mb-0 ms-2">Status Information</h6>
            </div>
            <p className="mb-0">{getStatusDescription(vehicle.current_status)}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4 d-flex justify-content-end gap-2">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowDetailsModal(false)}
            >
              Close
            </Button>
            <Button 
              variant="primary"
              onClick={() => {
                setShowDetailsModal(false);
                if (onEdit) onEdit(vehicle);
              }}
            >
              <FaEdit className="me-2" /> Edit Vehicle
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        size="sm"
        className="custom-modal"
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="text-danger">
            <FaExclamationTriangle className="me-2" />
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="mb-4">
            <div className="display-1 text-danger mb-3">
              <FaCar />
            </div>
            <h5>Delete Vehicle?</h5>
            <p className="text-muted">
              Are you sure you want to delete vehicle <strong>{vehicle.registration_number}</strong>?
              This action cannot be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowDeleteModal(false)}
            className="btn-custom"
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            className="btn-custom btn-custom-danger"
          >
            <FaTrash className="me-2" /> Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

// Default props
VehicleCard.defaultProps = {
  vehicle: {
    id: 0,
    registration_number: 'N/A',
    vehicle_type: 'Unknown',
    hospital_name: 'Not specified',
    current_status: 'operational',
    created_at: new Date().toISOString()
  },
  showActions: true,
  compact: false
};

export default VehicleCard;