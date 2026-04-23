import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import Modal from '../components/Modal';
import '../styles/Auth.css';

interface SignUpPageProps {
    onRegister: (user: { email: string; password: string; name: string; }) => void;
}

const emailRegex = /^[^\s@ㄱ-ㅎ가-힣]+@[^\s@ㄱ-ㅎ가-힣]+\.[^\s@ㄱ-ㅎ가-힣]+$/;

const SignUpPage: React.FC<SignUpPageProps> = ({ onRegister }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const onlyEnglishNumberSpecial = (text: string) => {
        return text.replace(/[^A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g, '');
    };
    const [name, setName] = useState('');
    const [isVerifiedAttempted, setIsVerifiedAttempted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalIcon, setModalIcon] = useState(false);

    const handleVerification = () => {
        setModalIcon(false);
        if (!email) {
            setModalMessage('이메일을 먼저 입력해주세요.');
            setShowModal(true);
            return;
        }

        if (!emailRegex.test(email)) {
            setModalMessage('이메일을 다시 확인해주세요.');
            setShowModal(true);
            return;
        }

        setIsVerifiedAttempted(true);
        setModalMessage(`${email}으로 인증 메일이 발송되었습니다. 메일을 확인해주세요.`);
        setShowModal(true);
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        setModalIcon(false);

        if (!emailRegex.test(email)) {
            setModalMessage('이메일을 다시 확인해주세요.');
            setShowModal(true);
            return;
        }

        if (!isVerifiedAttempted) {
            setModalMessage('이메일 인증을 완료해주세요.');
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
            setModalMessage('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
            setShowModal(true);
            return;
        }

        if (!name) {
            setModalMessage('이름을 입력해주세요.');
            setShowModal(true);
            return;
        }

        onRegister({ email, password, name });
        setModalMessage('회원가입 성공!');
        setModalIcon(true);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        if (modalMessage === '회원가입 성공!') {
            navigate('/login');
        }
    };

    return (
        <div className="auth-page">
            {showModal && <Modal message={modalMessage} onClose={handleModalClose} showIcon={modalIcon} />}
            <AuthForm title="회원가입">
                <form onSubmit={handleSignUp}>
                    <div className="input-group">
                        <label>이메일</label>
                        <div className="email-verify-group">
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button type="button" className="link-button" onClick={handleVerification}>
                                인증
                            </button>
                        </div>
                    </div>
                    <AuthInput
                        label="비밀번호"
                        type="password"
                        value={password}
                        inputMode="text"
                        autoComplete="new-password"
                        onChange={(e) => setPassword(onlyEnglishNumberSpecial(e.target.value))}
                    />
                    <AuthInput
                        label="비밀번호 확인"
                        type="password"
                        value={confirmPassword}
                        inputMode="text"
                        autoComplete="new-password"
                        onChange={(e) => setConfirmPassword(onlyEnglishNumberSpecial(e.target.value))}
                    />
                    <AuthInput
                        label="이름"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <AuthButton text="회원가입" />
                </form>
            </AuthForm>
        </div>
    );
};

export default SignUpPage;