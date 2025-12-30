import { useContext } from "react";
import { useCamperProfileQuery, useRotarianReviewQuery, useRotaryClubQuery } from "../../queries/queries";
import { AuthContext } from "../../App";
import { Link } from "react-router";
import { ThinSpacer } from "../../components/ThinSpacer";

export function CamperRotaryClubReview() {

    const authContext = useContext(AuthContext);

    const { data: rotarianReview } = useRotarianReviewQuery(authContext.attributes.sub);
    const { data: camperProfile } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: rotaryClub } = useRotaryClubQuery(camperProfile?.rotaryClubId);

    if (rotarianReview?.review === "APPROVED") {
        return (
            <div>
                <p>Congratulations! Your local rotary club has approved your application.
                    Please proceed to the <Link to="/camper/important-documents">Important Documents</Link> page to upload your documents required for camp.
                </p>
            </div>
        )
    }
    else if (rotarianReview?.review === "REJECTED") {
        return (
            <div>
                <p>Unfortunately, your application to RYLA was not accepted.
                    If you have any questions, please contact your local rotary club.
                </p>
            </div>
        )
    }

    return (
        <div>
            <p>Your local rotary club has received your application. You do not need to do anything further at this time. This page will automatically update and you will be notified via email when your application has been reviewed.</p>

            {rotaryClub?.requiresInterview && (
                <>
                    <h5>Interview</h5>
                    <ThinSpacer />
                    <p>
                        Your local rotary club requires an interview as part of the application process.
                        You will be contacted by your club in the next few weeks to schedule an interview.
                    </p>
                </>
            )}
        </div>
    )
}