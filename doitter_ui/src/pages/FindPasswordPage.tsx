import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import Modal from '../components/Modal';
import '../styles/Auth.css';

const emailRegex = /^[^\s@ㄱ-ㅎ가-힣]+@[^\s@ㄱ-ㅎ가-힣]+\.[^\s@ㄱ-ㅎ가-힣]+$/;

const FindPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalIcon, setModalIcon] = useState(false);

    const handleFindPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setModalIcon(false);

        if (!email) {
            setModalMessage('가입 시 사용한 이메일을 입력해주세요.');
        } else if (!emailRegex.test(email)) {
            setModalMessage('이메일을 다시 확인해주세요.');
        } else {
            setModalMessage('비밀번호 재설정 메일이 발송되었습니다.');
            setModalIcon(true);
        }
        setShowModal(true);
    };

    return (
        <div className="auth-page">
            {showModal && <Modal message={modalMessage} onClose={() => setShowModal(false)} showIcon={modalIcon} />}
            <AuthForm title="비밀번호 찾기">
                <form onSubmit={handleFindPassword}>
                    <AuthInput label="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <AuthInput label="이름" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    <AuthButton text="비밀번호 찾기" />
                </form>
            </AuthForm>
        </div>
    );
};

export default FindPasswordPage;