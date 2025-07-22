import '../styles/navbar.scss';
import { UseAuthenticator } from '@aws-amplify/ui-react';
import { Button, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router';

interface NavBarProps {
    signOut: UseAuthenticator["signOut"] | undefined;
    children?: React.ReactNode;
    title?: string;
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
                {items.map(({ name, disabled, action },i) => {
                    if (!name && !action && !disabled) {
                        return <Dropdown.Divider key={i}/>
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

export function NavBar({ signOut, title, children }: NavBarProps) {
    const navigate = useNavigate();
    return (
        <div id="nav">
            <span style={{ cursor: 'pointer' }} onClick={() => { navigate('/') }}>
                <b>{title}</b>
            </span>
            {children}
            <NavRight>
                <button id="signout-button" onClick={() => { if (signOut) signOut() }}>Sign Out</button>
            </NavRight>
        </div>
    )
}
