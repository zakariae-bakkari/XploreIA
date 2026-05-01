import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessStep = () => {
    return (
        <div className="signup-step success-step">
            <div className="success-icon-wrapper">
                <CheckCircle size={64} color="#10b981" />
            </div>
            <h1>Welcome to XploreIA!</h1>
            <p>Your account has been created successfully. Redirecting you...</p>
        </div>
    );
};

export default SuccessStep;
