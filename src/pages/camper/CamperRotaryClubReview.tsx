import { useContext } from "react";
import { useRotarianReviewQuery } from "../../queries/queries";
import { AuthContext } from "../../App";
import { Link } from "react-router";

export function CamperRotaryClubReview() {

    const authContext = useContext(AuthContext);

    const { data: rotarianReview } = useRotarianReviewQuery(authContext.attributes.sub);

    if(rotarianReview?.review === "APPROVED") {
        return (
            <div>
                <p>Congratulations! Your local rotary club has approved your application.
                    Please proceed to the <Link to="/camper/important-documents">Important Documents</Link> page to upload your documents required for camp.
                </p>
            </div>
        )
    }
    else if(rotarianReview?.review === "REJECTED") {    
        return (
            <div>
                <p>Unfortunately, your local rotary club has rejected your application.
                    If you have any questions, please contact your local rotary club.
                </p>
            </div>
        )
    }

    return (
        <div>
            <p>Your local rotary club has received your application. You do not need to do anything further at this time.
                This page will automatically update and you will be notified via email when your application has been reviewed.</p>
        </div>
    )
}