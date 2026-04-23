import React from 'react';
import '../styles/Auth.css';

interface AuthFormProps {
    title: string;
    children: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({ title, children }) => {
    return (
        <div className="auth-form-container">
            <h1>{title}</h1>
            {children}
        </div>
    );
};

export default AuthForm;