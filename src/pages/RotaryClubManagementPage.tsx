import React, { useMemo, useState } from 'react';
import { Button, Form, Modal, Alert, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChevronUp, faChevronDown, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FormModal } from '../components/modals';
import { Link } from 'react-router';
import '../styles/admin-page.scss';
import {
    createColumnHelper,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    RowSelectionState,
    flexRender
} from '@tanstack/react-table';
import { useListRotaryClubsQuery } from '../queries/queries';
import { RotaryClubSchemaType } from '../api/apiRotaryClub';
import { useForm, SubmitHandler } from 'react-hook-form';
import { emitToast, ToastType } from '../utils/notifications';
import { useCreateRotaryClubMutation, useUpdateRotaryClubMutation } from '../queries/adminMutations';
import { useQueryClient } from '@tanstack/react-query';
import { Container } from 'react-bootstrap';

type RotaryClubFormType = {
    name: string;
    requiresApplication: boolean;
    requiresInterview: boolean;
    numRequiredLetters: number;
};

export const RotaryClubManagementPage: React.FC = () => {
    const [showClubModal, setShowClubModal] = useState(false);
    const [editingClub, setEditingClub] = useState<RotaryClubSchemaType | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const { data: rotaryClubs, isLoading, error } = useListRotaryClubsQuery();
    const createRotaryClubMutation = useCreateRotaryClubMutation();
    const updateRotaryClubMutation = useUpdateRotaryClubMutation();
    const queryClient = useQueryClient();

    const form = useForm<RotaryClubFormType>({
        defaultValues: {
            name: '',
            requiresApplication: false,
            numRequiredLetters: 0,
        }
    });

    const columnHelper = createColumnHelper<RotaryClubSchemaType>();

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Club Name',
            cell: (info) => (
                <Link 
                    to={`/admin/rotary-club-details?id=${info.row.original.id}`}
                    
                >
                    {info.getValue()}
                </Link>
            ),
        }),
        columnHelper.accessor('requiresApplication', {
            header: 'Requires Application',
            cell: (info) => (
                <span className={`badge ${info.getValue() ? 'bg-success' : 'bg-danger'}`}>
                    {info.getValue() ? 'Yes' : 'No'}
                </span>
            ),
        }),
        columnHelper.accessor('numRequiredLetters', {
            header: 'Required Number of Letters',
            cell: (info) => (info.getValue() ? info.getValue() : 0),
        }),
        columnHelper.accessor('requiresInterview', {
            header: 'Requires Interview',
            cell: (info) => (
                <span className={`badge ${info.getValue() ? 'bg-success' : 'bg-danger'}`}>
                    {info.getValue() ? 'Yes' : 'No'}
                </span>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEditClub(info.row.original)}
                >
                    <FontAwesomeIcon icon={faEdit} className="me-1" />
                    Edit
                </Button>
            ),
        }),
    ], [columnHelper]);

    const tableData = useMemo(() => rotaryClubs ?? [], [rotaryClubs]);

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getRowId: (row) => row.id,
        state: {
            sorting,
            rowSelection
        },
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
    });

    const handleEditClub = (club: RotaryClubSchemaType) => {
        setEditingClub(club);
        form.reset({
            name: club.name || '',
            requiresApplication: club.requiresApplication || false,
            numRequiredLetters: club.numRequiredLetters || 0,
        });
        setShowClubModal(true);
    };

    const handleAddClub = () => {
        setEditingClub(null);
        form.reset({
            name: '',
            requiresApplication: false,
            numRequiredLetters: 0,
        });
        setShowClubModal(true);
    };

    const handleSubmitClub: SubmitHandler<RotaryClubFormType> = async (data) => {
        const isEditing = editingClub && editingClub.id;

        if (isEditing) {
            // Update existing club
            updateRotaryClubMutation.mutate(
                {
                    id: editingClub.id,
                    ...data
                },
                {
                    onSuccess: () => {
                        emitToast("Rotary club updated", ToastType.Success);
                        queryClient.invalidateQueries({ queryKey: ["rotaryClubs"] });
                    },
                    onSettled: () => {
                        setShowClubModal(false);
                        setEditingClub(null);
                        form.reset();
                    },
                    onError: (error) => {
                        console.error('Error updating rotary club:', error);
                        emitToast("Failed to update rotary club. Please try again.", ToastType.Error);
                    }
                }
            );
        } else {
            // Create new club
            createRotaryClubMutation.mutate(data, {
                onSuccess: () => {
                    emitToast("Rotary club created", ToastType.Success);
                    queryClient.invalidateQueries({ queryKey: ["rotaryClubs"] });
                },
                onSettled: () => {
                    setShowClubModal(false);
                    setEditingClub(null);
                    form.reset();
                },
                onError: (error) => {
                    console.error('Error creating rotary club:', error);
                    emitToast("Failed to create rotary club. Please try again.", ToastType.Error);
                }
            });
        }
    };

    if (isLoading) {
        return (
            <Container className="rotary-club-management">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <Spinner animation="border" role="status" />
                        <p className="mt-2">Loading rotary clubs...</p>
                    </div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="rotary-club-management">
                <Alert variant="danger">
                    Error loading rotary clubs: {error.message}
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="rotary-club-management">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <h3>Rotary Clubs</h3>
                    <p>Manage rotary clubs and their settings</p>
                </div>
                <div>
                    <Button
                        variant="primary"
                        onClick={handleAddClub}
                        className="me-2"
                    >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Add Club
                    </Button>
                </div>
            </div>

            <Table bordered hover>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    colSpan={header.colSpan}
                                    onClick={header.column.getToggleSortingHandler()}
                                    style={{ cursor: 'pointer' }}
                                    className="user-select-none"
                                >
                                    <span>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        <span className="sort-icon ms-2">
                                            {header.column.getIsSorted() ? (
                                                header.column.getIsSorted() === 'asc' ?
                                                    <FontAwesomeIcon icon={faChevronUp} /> :
                                                    <FontAwesomeIcon icon={faChevronDown} />
                                            ) : ''}
                                        </span>
                                    </span>

                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {rotaryClubs && rotaryClubs.length > 0 ? 
                        (table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={table.getAllColumns().length} className="text-center">No rotary clubs found</td>
                        </tr>
                    )}
                </tbody>
            </Table>
            {/* Club Modal */}
            <FormModal
                show={showClubModal}
                onClose={() => setShowClubModal(false)}
                title={editingClub ? "Edit Rotary Club" : "Add New Rotary Club"}
            >
                <Form onSubmit={form.handleSubmit(handleSubmitClub)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Club Name *</Form.Label>
                            <Form.Control
                                type="text"
                                {...form.register("name", { required: "Club name is required" })}
                                isInvalid={!!form.formState.errors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {form.formState.errors.name?.message}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Required Number of Letters *</Form.Label>
                            <Form.Control
                                type="number"
                                {...form.register("numRequiredLetters", {
                                    required: "Please input the number of letters this club requires",
                                    min: {
                                        value: 0,
                                        message: "Please input a number of at least 0"
                                    },
                                    max: {
                                        value: 5,
                                        message: "Please input a number of at most 5"
                                    }
                                })}
                            />
                            <Form.Text className="text-muted">
                                Enter the number of letters of recommendation this club requires students to submit.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Requires Application"
                                {...form.register("requiresApplication")}
                            />
                            <Form.Text className="text-muted">
                                Check this if campers from this club need to submit an application essay
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Requires Interview"
                                {...form.register("requiresInterview")}
                            />
                            <Form.Text className="text-muted">
                                Check this if campers from this club must be interviewed by club representatives
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="light"
                            onClick={() => setShowClubModal(false)}
                            disabled={createRotaryClubMutation.isPending || updateRotaryClubMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={createRotaryClubMutation.isPending || updateRotaryClubMutation.isPending}
                        >
                            {(createRotaryClubMutation.isPending || updateRotaryClubMutation.isPending) ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    {editingClub ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                editingClub ? 'Update Club' : 'Create Club'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </FormModal>
        </Container >
    );
};
