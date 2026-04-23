import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import Modal from '../components/Modal';
import '../styles/Auth.css';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalIcon, setModalIcon] = useState(false);

    const onlyEnglishNumberSpecial = (text: string) => {
        return text.replace(/[^A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g, '');
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setModalIcon(false);

        if (!password || !confirmPassword) {
            setModalMessage('새 비밀번호를 모두 입력해주세요.');
            setShowModal(true);
            return;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setModalMessage('비밀번호는 영문, 숫자, 특수기호 포함 8자리 이상이어야 합니다.');
            setShowModal(true);
            return;
        }

        if (password !== confirmPassword) {
            setModalMessage('비밀번호가 일치하지 않습니다.');
            setShowModal(true);
            return;
        }

        setModalMessage('비밀번호가 재설정되었습니다. 다시 로그인해주세요.');
        setModalIcon(true);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        if (modalMessage === '비밀번호가 재설정되었습니다. 다시 로그인해주세요.') {
            navigate('/login');
        }
    };

    return (
        <div className="auth-page">
            {showModal && <Modal message={modalMessage} onClose={handleCloseModal} showIcon={modalIcon} />}
            <AuthForm title="비밀번호 재설정">
                <form onSubmit={handleResetPassword}>
                    <AuthInput
                        label="새 비밀번호"
                        type="password"
                        inputMode="text"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(onlyEnglishNumberSpecial(e.target.value))}
                    />
                    <AuthInput
                        label="새 비밀번호 확인"
                        type="password"
                        inputMode="text"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(onlyEnglishNumberSpecial(e.target.value))}
                    />
                    <AuthButton text="재설정" />
                </form>
            </AuthForm>
        </div>
    );
};

export default ResetPasswordPage;