import Form from 'react-bootstrap/Form';

function CheckBox({className, type, label, field, handleChange, defaultChecked}) {
    return <Form.Check className={className} type={type} label={label} defaultChecked={defaultChecked}
                       onChange={(e) => handleChange(field, {checked: e.target.checked, value: label})}/>
}

export default CheckBox
