import Form from "react-bootstrap/Form";

function Label({ className, type, value, k, handleChange, handleBlur, rows, placeholder, as, min, max , disabled,readOnly}) {
  return (
    <Form.Control
      className={className}
      type={type}
      value={value}
      onChange={(e) => handleChange(k, e.target.value)}
      onBlur={handleBlur}
      rows={rows}
      placeholder={placeholder}
      as={as}
      min={min}
      max={max}
      disabled = {(disabled)? "disabled" : ""}
      readOnly ={(readOnly)? "readOnly" : ""}
    />
  );
}

export default Label;
