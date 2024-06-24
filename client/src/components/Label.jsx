import Form from 'react-bootstrap/Form';

function Label({className, type, value, k, handleChange, handleBlur, rows, placeholder, as}) {
    return (
        <Form.Control className={className} type={type} value={value} onChange={(e) => handleChange(k, e.target.value)}
                      onBlur={handleBlur} rows={rows} placeholder={placeholder} as={as}/>
    )
}

export default Label
