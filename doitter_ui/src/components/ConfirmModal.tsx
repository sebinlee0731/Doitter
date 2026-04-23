import React from 'react';
import styled from 'styled-components';

interface ConfirmModalProps {
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmModal({
                                         message,
                                         onCancel,
                                         onConfirm,
                                         confirmText = "확인",
                                         cancelText = "취소"
                                     }: ConfirmModalProps) {
    return (
        <Backdrop>
            <Box>
                <Message>{message}</Message>
                <Actions>
                    <CancelBtn onClick={onCancel}>{cancelText}</CancelBtn>
                    <ConfirmBtn onClick={onConfirm}>{confirmText}</ConfirmBtn>
                </Actions>
            </Box>
        </Backdrop>
    );
}

const Backdrop = styled.div`
  position:fixed; inset:0;
  background:rgba(0,0,0,0.5);
  display:flex; align-items:center; justify-content:center;
  z-index: 3000;
`;

const Box = styled.div`
  background:white;
  padding:24px;
  border-radius:8px;
  width:320px;
`;

const Message = styled.div`
  font-size:15px;
  margin-bottom:20px;
`;

const Actions = styled.div`
  display:flex;
  justify-content:flex-end;
  gap:12px;
`;

const CancelBtn = styled.button`
  padding:8px 14px;
  color:#374151;
  border:1px solid #D1D5DB;
  border-radius:6px;
`;

const ConfirmBtn = styled.button`
  padding:8px 14px;
  color:white;
  background:#EF4444;
  border-radius:6px;
  border:none;
`;