
import { ThinSpacer } from "../components/ThinSpacer";

export const HelpPage = () => {
    const directorEmail = import.meta.env.VITE_APP_DIRECTOR_EMAIL;
    const itSupportEmail = import.meta.env.VITE_APP_IT_SUPPORT_EMAIL;

    return (
        <div className="side-pad-20">
            <h4>Help</h4>
            <ThinSpacer />
            <h5>For questions about RYLA, Rotary, camp, documents, or the registration process, please contact <a href={`mailto:${directorEmail}`}>{directorEmail}</a></h5>
            <br/>

            <h5>For technical issues with this portal, please contact <a href={`mailto:${itSupportEmail}`}>{itSupportEmail}</a></h5>

        </div>
    )
}