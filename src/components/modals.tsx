import { Col, Row, Modal, Form, Button } from 'react-bootstrap';
import { IconButton } from '../utils/button';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useCallback } from "react";
import { SpinnerButton } from '../utils/button';

interface ConfirmationModalProps {
    title?: string;
    show: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    onConfirm?: () => void;
    isLoading?: boolean;
}

export function ConfirmationModal({ show, onClose, title, children, onConfirm, isLoading }: ConfirmationModalProps) {

    return (
        <Modal show={show} size="lg" centered onHide={() => onClose()}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="light" onClick={onClose}>Cancel</Button>
                <SpinnerButton loading={!!isLoading} variant="primary" onClick={onConfirm}>Confirm</SpinnerButton>
            </Modal.Footer>
        </Modal>
    );
}

interface MultiStepViewProps {
    children?: React.ReactNode;
    currentStep: number;
}

export function MultiStepView({ children, currentStep }: MultiStepViewProps) {

    // Ensure children is always an array
    const steps = children ? React.Children.toArray(children) : [];

    currentStep = Math.min(currentStep, steps.length - 1);
    currentStep = Math.max(currentStep, 0);

    return (
        <div>
            {steps[currentStep]}
        </div>
    );

}
