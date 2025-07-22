import { Form } from "react-bootstrap";
import { UseFormRegister, FieldErrors, FieldValues } from "react-hook-form";

// interface TextInputGroupProps<T extends FieldValues> {
//     key: string;
//     register: UseFormRegister<T>;
//     errors: FieldErrors<T>;
// }

// export function TextInputGroup({ label, name, register, errors }: TextInputGroupProps<T>) {
//     return (
//         <Form.Group className="form-group">
//             <Form.Label>First Name</Form.Label>
//             <Form.Control type="text" {...register("firstName", { required: true })} isInvalid={!!errors.firstName} />
//             <Form.Control.Feedback type="invalid">
//                 Please enter a first name.
//             </Form.Control.Feedback>
//         </Form.Group>
//     );
// }