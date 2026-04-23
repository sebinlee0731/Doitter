import React, { useState } from 'react';
import styled from 'styled-components';
import { SketchPicker, ColorResult } from 'react-color';

interface ColorPickerModalProps {
    initialColor: string;
    onClose: () => void;
    onSave: (color: string) => void;
}

export default function ColorPickerModal({ initialColor, onClose, onSave }: ColorPickerModalProps) {
    const [color, setColor] = useState(initialColor);

    const handleChange = (colorResult: ColorResult) => {
        setColor(colorResult.hex);
    };

    const handleSave = () => {
        onSave(color);
        onClose();
    };

    return (
        <ModalBackdrop>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <Title>프로젝트 색상 선택</Title>

                <PickerContainer>
                    <SketchPicker
                        color={color}
                        onChangeComplete={handleChange}
                        disableAlpha={true}
                        presetColors={[]}
                    />
                    <PreviewWrapper>
                        <ColorPreview style={{ backgroundColor: color }} />
                    </PreviewWrapper>
                </PickerContainer>

                <FormActions>
                    <CancelButton onClick={onClose}>취소</CancelButton>
                    <SubmitButton onClick={handleSave}>확인</SubmitButton>
                </FormActions>
            </ModalContent>
        </ModalBackdrop>
    );
}

const ModalBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
`;

const ModalContent = styled.div`
    padding: 16px;
    background-color: #FFFFFF;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    width: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const Title = styled.h2`
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 16px 0;
    border-bottom: 1px solid #E0E0E0;
    padding-bottom: 16px;
`;

const PickerContainer = styled.div`
    display: flex;
    gap: 16px;

    .sketch-picker {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        border-radius: 0 !important;
    }
`;

const PreviewWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 16px;
    border-left: 1px solid #E0E0E0;
`;

const ColorPreview = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 1px solid #D1D5DB;
    background-color: ${props => props.color};
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #E0E0E0;
`;

const CancelButton = styled.button`
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background-color: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    cursor: pointer;
`;

const SubmitButton = styled.button`
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #FFFFFF;
    background-color: #1F2937;
    border: none;
    border-radius: 6px;
    cursor: pointer;
`;