import Form from 'react-bootstrap/Form'

function Option({className, options, field, handleChange}) {
    return (
        <Form.Select className={className} onChange={(e) => handleChange(field, e.target.value)}>
            {options.map((item, i) => (
                <option key={i} value={item.node}>{item.label}</option>
            ))}
        </Form.Select>
    );
}

export default Option
