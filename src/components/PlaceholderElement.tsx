import { Placeholder } from "react-bootstrap";

interface PlaceholderTextProps {
    children: React.ReactNode,
    isLoading: boolean,
    props?: React.ComponentProps<typeof Placeholder>
}

export function PlaceholderElement({ children, isLoading, props }: PlaceholderTextProps) {
    if(isLoading) {
        return (
            <Placeholder as={props?.as} animation="glow">
                <Placeholder xs={props?.xs} />
            </Placeholder>
        );
    }
    else {
        return children;
    }
}