import React from 'react';
import '../styles/Modal.css';

interface ModalProps {
    message: string;
    onClose: () => void;
    showIcon?: boolean;
}

const Modal: React.FC<ModalProps> = ({ message, onClose, showIcon }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {showIcon && <div className="modal-icon">✓</div>}
                <p className="modal-message">{message}</p>
                <button className="modal-button" onClick={onClose}>
                    확인
                </button>
            </div>
        </div>
    );
};

export default Modal;