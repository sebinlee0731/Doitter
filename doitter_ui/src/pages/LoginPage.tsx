import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import Modal from '../components/Modal';
import '../styles/Auth.css';

interface LoginPageProps {
    onLogin: (email: string, password: string) => { name: string } | null;
}

const emailRegex = /^[^\s@ㄱ-ㅎ가-힣]+@[^\s@ㄱ-ㅎ가-힣]+\.[^\s@ㄱ-ㅎ가-힣]+$/;

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [loginSuccess, setLoginSuccess] = useState(false);

    const onlyEnglishNumberSpecial = (text: string) => {
        return text.replace(/[^A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g, '');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginSuccess(false);

        if (!email || !password) {
            setModalMessage('이메일과 비밀번호를 모두 입력해주세요.');
            setShowModal(true);
            return;
        }

        if (!emailRegex.test(email)) {
            setModalMessage('이메일을 다시 확인해주세요.');
            setShowModal(true);
            return;
        }

        const user = onLogin(email, password);

        if (user) {
            setModalMessage('로그인 성공!');
            setLoginSuccess(true);
        } else {
            setModalMessage('이메일 또는 비밀번호가 일치하지 않습니다.');
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        if (loginSuccess) {
            navigate('/main');
        }
    };

    return (
        <div className="auth-page">
            {showModal && <Modal message={modalMessage} onClose={handleCloseModal} showIcon={loginSuccess} />}
            <AuthForm title="로그인">
                <form onSubmit={handleLogin}>
                    <AuthInput label="이메일(아이디)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <AuthInput
                        label="비밀번호"
                        type="password"
                        value={password}
                        inputMode="text"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(onlyEnglishNumberSpecial(e.target.value))}
                    />
                    <div className="auth-links">
                        <Link to="/find-password" className="auth-link">비밀번호 찾기</Link>
                        <Link to="/signup" className="auth-link">회원가입</Link>
                    </div>
                    <AuthButton text="로그인" />
                </form>
            </AuthForm>
        </div>
    );
};

export default LoginPage;