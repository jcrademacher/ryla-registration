import { useMutation } from "@tanstack/react-query";
import { sendEmail } from "../api/apiEmail";

const CONTINUE_AT_MSG = (loc: string) => `Please continue with your registration process at <a href="${loc}">${loc}</a>.`;

export function useRejectDocumentEmailMutation() {
    return useMutation({
        mutationKey: ['rejectDocumentEmail'],
        mutationFn: async ({ docName, templateName, to, message }: {
            docName: string
            templateName: string
            to: (string | null | undefined)[],
            message?: string,
            replyTo?: string
        }) => {
            const url = `${window.location.origin}/camper/important-documents`;

            const body = `
                <p>A camp administrator has reviewed your '${templateName}' and found an issue with it. 
                Please see the comments below and resubmit the document at 
                <a href="${url}">${url}</a>.</p>
                <p><b>Document: ${docName ? docName : templateName}</b></p>
                ${message ? `<p>Comments: ${message}</p>` : ''}
            `;

            return sendEmail(to, "[ACTION REQUIRED] Issue with your registration document", body, "director@ryla7780.org");
        },
    });
}

export function useApproveDocumentEmailMutation() {
    return useMutation({
        mutationKey: ['approveDocumentEmail'],
        mutationFn: async ({ templateName, to }: {
            templateName: string
            to: (string | null | undefined)[],
            replyTo?: string
        }) => {
            const body = `
                <p>A camp administrator has approved your '${templateName}' document. No further action is required.</p>
                <p>${CONTINUE_AT_MSG(`${window.location.origin}/camper/important-documents`)}</p>
            `;

            return sendEmail(to, "Document Approved", body, "director@ryla7780.org");
        },
    });
}

export function useReceivedDocumentEmailMutation() {
    return useMutation({
        mutationKey: ['receivedDocumentEmail'],
        mutationFn: async ({ templateName, to }: {
            templateName: string
            to: (string | null | undefined)[],
            replyTo?: string
        }) => {
            const body = `
                <p>A camp administrator has received your '${templateName}' document. No further action is required.</p>
                <p>${CONTINUE_AT_MSG(`${window.location.origin}/camper/important-documents`)}</p>
            `;

            return sendEmail(to, "Document Received", body, "director@ryla7780.org");
        },
    });
}

export function useSendAdmissionEmailMutation() {
    return useMutation({
        mutationKey: ['sendAdmissionEmail'],
        mutationFn: async ({ to }: { to: (string | null | undefined)[] }) => {

            const body =
                `
                <p>Congratulations! Your local rotary club has approved your application to RYLA!</p>
                <p>${CONTINUE_AT_MSG(`${window.location.origin}/camper/important-documents`)}</p>
                <p>There, you will find important documents that you must to complete prior to camp.</p>
            `;

            return sendEmail(to, `[ACTION REQUIRED] Acceptance to RYLA!`, body);
        }
    });
}