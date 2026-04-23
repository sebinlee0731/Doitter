import React from 'react';
import '../styles/Auth.css';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const AuthInput: React.FC<AuthInputProps> = ({ label, ...rest }) => {
    return (
        <div className="input-group">
            <label>{label}</label>
            <input
                {...rest}
                className="input-field"
            />
        </div>
    );
};

export default AuthInput;