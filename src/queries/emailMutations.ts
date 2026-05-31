import { useMutation } from "@tanstack/react-query";
import { sendEmail } from "../api/apiEmail";

export function useSendRotarianRequestEmailMutation() {
    return useMutation({
        mutationKey: ['sendRotarianRequestEmail'],
        mutationFn: async ({ name, email, rotaryClub }: { name: string, email: string, rotaryClub: string }) => {
            const cat = `${window.location.origin}/admin/user-management`;
            
            const body = `
                <p>A user is requesting to be a rotarian.</p>
                <p><b>Name: </b>${name}</p>
                <p><b>Email: </b>${email}</p>
                <p><b>Rotary Club: </b>${rotaryClub}</p>
                <p>Please approve or reject this request at <a href="${cat}">${cat}</a>.</p>
            `;

            return sendEmail(["director@ryla7780.org"], "[ACTION REQUIRED] Rotarian Request", body);
        }
    });
}