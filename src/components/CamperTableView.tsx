import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';

export const CamperTableView: React.FC = () => {
    return (
        <div className="camper-table-view">
            <h3>Camper Applications</h3>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>School</th>
                        <th>Rotary Club</th>
                        <th>Status</th>
                        <th>Profile</th>
                        <th>Application</th>
                        <th>Documents</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={8} className="text-center text-muted">
                            No campers found. Use the "Add Camper" button to create new camper accounts.
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );
};
