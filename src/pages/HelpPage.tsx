import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert } from "react-bootstrap";

export const HelpPage = () => {
    return (
        <div>
            <Alert variant="info">
                <FontAwesomeIcon icon={faCircleInfo} className="me-2" />
                After campers have been accepted, documents that are added here will be available for campers to view.
                <ul>
                    <li><strong>View-Only</strong> sets the document to be simply displayed to the camper (i.e., a welcome packet).</li>
                    <li><strong>Complete & Upload</strong> sets the document to be filled out by the camper and uploaded (i.e., a photo release).</li>
                    <li><strong>Complete & Mail</strong> sets the document to be filled out by the camper and mailed to the RYLA address (i.e., a medical form).</li>
                </ul>

            </Alert>

            <Alert variant="info">
                <FontAwesomeIcon icon={faCircleInfo} className="me-2" />
                The time zone for camp dates is Eastern Daylight Time (EDT).
                These dates will be displayed to campers and rotarians as the start (dropoff time) and end (pickup time) dates of camp.
            </Alert>

        </div>
    )
}