import Form from "react-bootstrap/Form";
import { useEffect , useRef} from "react";

function Option({ className, options, field, handleChange }) {
  const isFetched = useRef(false);
  useEffect(() => {
    if (!isFetched.current && options.length !== 0) {
      handleChange(field, options[0].node);
      isFetched.current = true;
    }
  }, [field, handleChange, options]);

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
