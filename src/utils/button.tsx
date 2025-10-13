import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Button } from "react-bootstrap";
import { Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type SpinnerButtonProps = {
    loading: boolean,
    children: React.ReactNode
} & React.ComponentProps<typeof Button>;

export function SpinnerButton({ loading, children, ...props }: SpinnerButtonProps) {
    return (
        <IconButton disabled={loading} {...props}>
            {loading ? (
                <Spinner as="span"
                animation="border"
                size="sm"
                role="status"
                    style={{ marginRight: "5px" }}
                />
            ) : <></>
            }
            {children}
        </IconButton>
    );
}

type IconButtonProps = {
    icon?: IconProp,
    position?: "left" | "right"
} & React.ComponentProps<typeof Button>;

export function IconButton({ icon, children, position = "left", ...props }: IconButtonProps) {
    return (
        <Button {...props}>
            {position === "left" && icon && <FontAwesomeIcon icon={icon} className="icon-left"/>}
            {children}
            {position === "right" && icon && <FontAwesomeIcon icon={icon} className="icon-right"/>}
        </Button>
    );
}


