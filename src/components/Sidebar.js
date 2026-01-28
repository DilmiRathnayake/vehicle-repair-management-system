import React, { useState } from 'react';
import { 
  Nav, 
  Navbar,
  NavDropdown,
  Badge,
  Collapse,
  Button
} from 'react-bootstrap';
import { 
  FaHome, 
  FaCar, 
  FaTools, 
  FaChartBar, 
  FaUsers, 
  FaCog, 
  FaSignOutAlt, 
  FaChevronDown, 
  FaChevronRight,
  FaUser,
  FaFileAlt,
  FaAmbulance,
  FaHospital,
  FaBell,
  FaHistory,
  FaDatabase,
  FaShieldAlt,
  FaQuestionCircle,
  FaInfoCircle,
  FaBars
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

const Sidebar = ({ user, collapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    repairs: true,
    management: true,
    reports: false,
    settings: false
  });

  const getDashboardPath = () => {
    if (!user) return '/login';
    
    switch(user.role) {
      case 'engineer': return '/engineer';
      case 'subject_officer': return '/officer';
      case 'rdhs': return '/rdhs';
      case 'admin': return '/admin';
      default: return '/login';
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path || 
           location.pathname.startsWith(path) ||
           (location.search && path.includes(location.search));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Navigation items based on role
  const getNavItems = () => {
    const items = [
      {
        id: 'dashboard',
        title: 'Dashboard',
        icon: <FaHome />,
        path: getDashboardPath(),
        badge: null
      },
      {
        id: 'vehicles',
        title: 'Vehicles',
        icon: <FaCar />,
        path: '/vehicles',
        badge: null
      }
    ];

    // Role-specific items
    if (user?.role === 'engineer') {
      items.push({
        id: 'repairs',
        title: 'Repairs',
        icon: <FaTools />,
        path: '/engineer',
        badge: null
      });
    } else if (user?.role === 'subject_officer') {
      items.push({
        id: 'repairs',
        title: 'Repairs',
        icon: <FaTools />,
        path: '/officer',
        badge: null
      });
    } else if (user?.role === 'rdhs') {
      items.push({
        id: 'repairs',
        title: 'Repairs',
        icon: <FaTools />,
        path: '/rdhs',
        badge: null
      });
    } else if (user?.role === 'admin') {
      items.push(
        {
          id: 'users',
          title: 'Users',
          icon: <FaUsers />,
          path: '/admin',
          badge: null
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: <FaCog />,
          path: '/admin?tab=settings',
          badge: null
        }
      );
    }

    // Common for all
    items.push({
      id: 'reports',
      title: 'Reports',
      icon: <FaChartBar />,
      path: '/reports',
      badge: null
    });

    return items;
  };

  const navItems = getNavItems();

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* User Profile Section */}
      {!collapsed && (
        <div className="sidebar-profile">
          <div className="profile-header text-center mb-4">
            <div className="profile-avatar mx-auto mb-3">
              <div className="avatar-circle">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
              <div className="online-status"></div>
            </div>
            <div>
              <h6 className="mb-1">{user?.name || 'User'}</h6>
              <div className="text-muted small mb-2">{user?.email || 'user@example.com'}</div>
              <Badge 
                bg={
                  user?.role === 'admin' ? 'danger' :
                  user?.role === 'rdhs' ? 'success' :
                  user?.role === 'subject_officer' ? 'info' : 'warning'
                }
                pill
              >
                {user?.role?.toUpperCase() || 'USER'}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Nav className="flex-column sidebar-nav">
        {navItems.map((item) => (
          <Nav.Item key={item.id}>
            <Nav.Link 
              href="#" 
              className={`d-flex align-items-center ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="nav-title">{item.title}</span>
                  {item.badge && (
                    <Badge bg="primary" pill className="ms-auto">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Nav.Link>
          </Nav.Item>
        ))}

        {/* Bottom Section */}
        {!collapsed && (
          <>
            <div className="sidebar-divider"></div>
            
            <Nav.Item>
              <Nav.Link 
                href="#" 
                className="d-flex align-items-center"
                onClick={() => navigate('/help')}
              >
                <span className="nav-icon"><FaQuestionCircle /></span>
                <span className="nav-title">Help & Support</span>
              </Nav.Link>
            </Nav.Item>
            
            <Nav.Item>
              <Nav.Link 
                href="#" 
                className="d-flex align-items-center"
                onClick={() => navigate('/about')}
              >
                <span className="nav-icon"><FaInfoCircle /></span>
                <span className="nav-title">About System</span>
              </Nav.Link>
            </Nav.Item>
            
            <Nav.Item>
              <Nav.Link 
                href="#" 
                className="d-flex align-items-center text-danger"
                onClick={handleLogout}
              >
                <span className="nav-icon"><FaSignOutAlt /></span>
                <span className="nav-title">Logout</span>
              </Nav.Link>
            </Nav.Item>
          </>
        )}
      </Nav>

      {/* System Info */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="text-center small text-muted">
            <div className="mb-1">
              <FaAmbulance className="me-1" />
              Vehicle Repair System
            </div>
            <div>v1.0.0</div>
          </div>
        </div>
      )}

      {/* Collapse Toggle Button */}
      <div className="sidebar-toggle" onClick={onToggleCollapse}>
        <FaBars className="toggle-icon" />
      </div>
    </div>
  );
};

// Default props
Sidebar.defaultProps = {
  user: {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'engineer'
  },
  collapsed: false
};

export default Sidebar;