import Form from "react-bootstrap/Form";
import { useEffect } from "react";

function Option({ className, options, field, handleChange }) {
  useEffect(() => {
    if (options.length !== 0) {
      handleChange(field, options[0].node);
    }
  }, []);
  return (
    <Form.Select className={className} onChange={(e) => handleChange(field, e.target.value)}>
      {options.map((item, i) => (
        <option key={i} value={item.node}>
          {item.label}
        </option>
      ))}
    </Form.Select>
  );
}

export default Option;
