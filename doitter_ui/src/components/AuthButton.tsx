import React from 'react';
import '../styles/Auth.css';

interface AuthButtonProps {
    text: string;
    onClick?: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ text, onClick }) => {
    return (
        <button type="submit" className="submit-button" onClick={onClick}>
            {text}
        </button>
    );
};

export default AuthButton;