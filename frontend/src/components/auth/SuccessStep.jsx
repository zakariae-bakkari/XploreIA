import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessStep = ({ 
    title = "Welcome to XploreIA!", 
    message = "Your account has been created successfully. Redirecting you..." 
}) => {
    return (
        <div className="signup-step success-step">
            <div className="success-icon-wrapper">
                <CheckCircle size={64} color="#10b981" />
            </div>
            <h1>{title}</h1>
            <p>{message}</p>
        </div>
    );
};

export default SuccessStep;
