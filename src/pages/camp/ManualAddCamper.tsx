import { FormModal } from "../../components/modals";

export function ManualAddCamper({ show, onClose }: { show: boolean, onClose: () => void }) {
    
    return (
        <FormModal
            show={show}
            onClose={onClose}
            title="Add Camper"
        >
            <div>

            </div>
        </FormModal>
    );
}