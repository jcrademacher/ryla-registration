import { Table } from "react-bootstrap";

interface RotarianPageProps {
}

export function RotarianPage({  }: RotarianPageProps) {
    return (
        <div className="rotarian-page">
            <h3>Rotarian Portal</h3>
            <p>Welcome to the rotarian portal. Here you can view camper applications and approve or reject them.</p>
            <Table bordered responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
            </Table>
        </div>
    );
}; 