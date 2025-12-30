import '../styles/navbar.scss';
import { UseAuthenticator } from '@aws-amplify/ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { faBars, faCampground, faQuestion, faUser, faPuzzlePiece, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useListGroupRequestsQuery } from '../queries/queries';

interface NavBarProps {
    signOut?: UseAuthenticator["signOut"] | undefined;
    title?: string;
    isAdmin?: boolean;
}

type DropdownOptions = {
    name?: string,
    action?: () => void,
    disabled?: boolean
}

interface DropdownProps {
    title: string;
    items: DropdownOptions[];
}

export function NavDropdown({ title, items }: DropdownProps) {
    return (
        <Dropdown className='nav-item'>
            <Dropdown.Toggle size="sm" id="dropdown-basic">
                {title}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {items.map(({ name, disabled, action }, i) => {
                    if (!name && !action && !disabled) {
                        return <Dropdown.Divider key={i} />
                    }
                    else {
                        return <Dropdown.Item disabled={disabled} onClick={action} key={name}>{name}</Dropdown.Item>
                    }
                }
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
}

export function NavRight({ children }: { children: React.ReactNode }) {
    return (
        <div className="right-nav">
            {children}
        </div>
    )
}

const notificationBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-3px',
    right: '-8px',
    backgroundColor: '#dc3545',
    color: 'white',
    borderRadius: '50%',
    width: '12px',
    height: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8px',
    fontWeight: 'bold',
};

export function NavOffcanvas({ show }: { show: boolean }) {
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const navigate = useNavigate();

    const { data: groupRequests } = useListGroupRequestsQuery(show);

    if (!show) {
        return null;
    }

    const closeNavigate = (path: string) => {
        setShowOffcanvas(false);
        navigate(path);
    }

    return (
        <span className="me-3">
            <span style={{ position: 'relative', display: 'inline-block' }}>
                <FontAwesomeIcon
                    icon={faBars} size="lg"
                    onClick={() => { setShowOffcanvas(true) }}
                    style={{ cursor: 'pointer' }}
                />
                {groupRequests && groupRequests.length > 0 && (
                    <span style={notificationBadgeStyle}>
                        {groupRequests.length}
                    </span>
                )}
            </span>
            <Offcanvas show={showOffcanvas} onHide={() => { setShowOffcanvas(false) }}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Admin Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Header className="admin-select-item" onClick={() => { closeNavigate('/admin') }}>
                    <FontAwesomeIcon icon={faCampground} className="icon" />
                    Camp Dashboard
                </Offcanvas.Header>
                <Offcanvas.Header className="admin-select-item" onClick={() => { closeNavigate('/admin/rotary-clubs') }}>
                    <FontAwesomeIcon icon={faPuzzlePiece} className="icon" />
                    Rotary Clubs
                </Offcanvas.Header>
                <Offcanvas.Header className="admin-select-item" onClick={() => { closeNavigate('/admin/user-management') }}>
                    <FontAwesomeIcon icon={faUsers} className="icon" />
                    <span style={{ position: 'relative', display: 'inline-block' }}>
                        User Management
                        {groupRequests && groupRequests.length > 0 && (
                            <span style={notificationBadgeStyle}>
                                {groupRequests.length}
                            </span>
                        )}
                    </span>
                </Offcanvas.Header>
            </Offcanvas>

        </span>

    )
}

export function NavBar({ isAdmin = false, signOut, title }: NavBarProps) {
    const navigate = useNavigate();

    return (
        <div id="nav">
            <NavOffcanvas show={isAdmin} />
            <span style={{ cursor: 'pointer' }} onClick={() => { navigate('/') }}>
                <b>{title}</b>
            </span>

            <NavRight>
                {signOut && (
                    <>
                        <Button
                            id="help-button"
                            onClick={() => { navigate('/help') }}
                        >
                            <FontAwesomeIcon icon={faQuestion} />
                        </Button>
                        <Button
                            id="profile-button"
                            onClick={() => { navigate('/profile') }}
                        >
                            <FontAwesomeIcon icon={faUser} />
                        </Button>
                        <button id="signout-button" onClick={() => { signOut() }}>Sign Out</button>
                    </>
                )}
            </NavRight>
        </div>
    )
}
