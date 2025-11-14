import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";
import { DateTime } from "luxon";
import { formatDateFullWithTime } from "../utils/datetime";

export const NotAcceptingApplications = () => {
    return (
        <div>
            <Alert variant="danger">
                <h4>RYLA is not accepting applications at this time</h4>
                <p>Please check back in the future for updates.</p>
            </Alert>
        </div>
    );
};

export const PreDeadline = ({ deadline }: { deadline: DateTime }) => {
    return (
        <Alert variant="success">
            <FontAwesomeIcon icon={faCircleInfo} className="me-2" /> 
            RYLA is currently accepting applications! Applications are due by {formatDateFullWithTime(deadline)}.
        </Alert>
    )
}

export const PastDeadlineCamper = () => {
    return (
        <Alert variant="warning">
            <FontAwesomeIcon icon={faCircleInfo} /> The application deadline has passed. 
            If you have already been admitted, you may continue at the{' '}
            <Link to="/camper/important-documents">Important Documents</Link> tab to complete the final steps for registration.
        </Alert>
    );
}

export const PastDeadlineRotarian = () => {
    return (
        <Alert variant="warning">
            <FontAwesomeIcon icon={faCircleInfo} /> The application deadline has passed. 
           You may still review applications and make decisions until the start of camp.
        </Alert>
    );
}