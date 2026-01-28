import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : undefined;
  
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5">
      <Spinner 
        animation="border" 
        role="status" 
        size={spinnerSize}
        variant="primary"
        className="mb-3"
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p className="text-muted">{message}</p>
    </div>
  );
};

export default LoadingSpinner;