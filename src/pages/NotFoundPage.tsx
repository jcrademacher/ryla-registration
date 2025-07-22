import React from 'react';
import { Link } from 'react-router';

export const NotFoundPage: React.FC = () => {
    return (
        <div className="not-found-page" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1>404 - Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
            <Link to="/" style={{ color: '#007bff', textDecoration: 'underline' }}>Return to Home</Link>
        </div>
    );
};
