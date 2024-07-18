import {Fragment, useEffect, useState} from "react";
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TimeLine from "./TimeLine";
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Option from "./Option";
import Label from "./Label";
import Collapse from 'react-bootstrap/Collapse';

function SimpleLabel({info, k, setInputAdd}) {
    const [inputValue, setInputValue] = useState('')
    const [other, setOther] = useState(false);

    const handleChangeSelect = (field, node) => {
        setInputAdd(inputAdd => ({...inputAdd, ...{[field]: {select: true, value: node}}}))
        setOther(node === 'Autre')
    }

    const handleChangeValue = (field, label) => {
        console.log(`${field}: ${label}`);
        setInputValue(label)
        setInputAdd(inputAdd => ({...inputAdd, ...{[field]: {select: false, value: label}}}))
    }

    let label;

    if (Array.isArray(info)) {
        label = <>
            <Option options={info} field={k} handleChange={handleChangeSelect}/>
            <Collapse in={other}>
                <div style={{marginTop: '0.5rem'}}>
                    <Label value={inputValue} k={k} handleChange={handleChangeValue}/>
                </div>
            </Collapse>
        </>
    } else if (typeof info === 'object' && info.collapse === true) {
        label = <Option options={info.value} field={k} handleChange={handleChangeSelect}/>
    } else if (info === 'date' || (typeof info === 'object' && info.type === 'date')) {
        label = <Label value={inputValue} k={k} handleChange={handleChangeValue} type={"date"}/>
    } else if (info === 'textarea' || (typeof info === 'object' && info.type === 'textarea')) {
        label = <Label value={inputValue} k={k} handleChange={handleChangeValue} rows={6} as={'textarea'}/>;
    } else {
        label = <Label value={inputValue} k={k} handleChange={handleChangeValue}/>
    }

    return label
}

function Field({info, section, k, setInputAdd, inputAdd}) {
    let field;
    const [collapse, setCollapse] = useState(true);
    useEffect(() => {
        if (section === 'Submit Data' && typeof info === 'object' && !Array.isArray(info) && info.collapse !== true) {
            setCollapse(inputAdd[info.collapse.field].value === info.collapse.value)
        }
    }, [info, inputAdd, section]);
    if (section === 'Submit Data') {
        field = <SimpleLabel info={info} k={k} setInputAdd={setInputAdd}></SimpleLabel>
    } else {
        if (Array.isArray(info)) {
            field = <>
                {info.map((item, index) => (
                    <Card.Link key={index} href={item.link} target="_blank">{item.text}</Card.Link>
                ))}
            </>
        } else {
            field = info
        }
    }

    return (
        <>
            <dt className={`col-sm-3 ${collapse ? 'collapse.show' : 'collapse'}`}>{k.replaceAll("_", " ")}</dt>
            <dd className={`col-sm-9 ${collapse ? 'collapse.show' : 'collapse'}`}>{field}</dd>
        </>
    );
}

function Phenotype({index, inputAdd, setInputAdd, info}) {
    const [inputValue, setInputValue] = useState(1)

    useEffect(() => {
        setInputAdd(prevInputAdd => {
            const updatedItems = {...prevInputAdd};
            if (info['Stage'][0] !== undefined){
                updatedItems['Phenotype'][index] = {stage: info['Stage'][0].node, phenotype: info['Phenotype'][0].node, value: ''};
            }
            return updatedItems
        });
    }, [index, setInputAdd,info]);

    const handleChange = (field, value) => {
        if (field === 'value') {
            setInputValue(value)
        }
        setInputAdd(prevInputAdd => {
            const updatedItems = {...prevInputAdd};
            if (updatedItems['Phenotype'][index] === {}) {
                updatedItems['Phenotype'][index] = {stage: '', phenotype: '', value: ''}
            }
            updatedItems['Phenotype'][index][field.toLowerCase()] = value;
            return updatedItems
        });
    }

    return (
        <InputGroup className="mb-3">
            <Option options={info['Phenotype']} field={'Phenotype'} handleChange={handleChange}></Option>
            <Option options={info['Stage']} field={'Stage'} handleChange={handleChange}></Option>
            <InputGroup style={{position: 'relative', flex: '1 1 auto', width: '1%', minWidth: 0}}>
                <Label type="number" value={inputValue} k={'value'} handleChange={handleChange} min={1} max={4}/>
                {inputAdd['Phenotype'][index]['phenotype'] === "http://ircan.org/schema/Lethality" &&
                    <InputGroup.Text id="basic-addon2">%</InputGroup.Text>}
            </InputGroup>
        </InputGroup>
    )
}

function DLRow({info, section, setInputAdd, inputAdd}) {
    return (<dl className="row align-self-center">
        {Object.keys(info).map((key, index) => (
            info[key] !== 'add' &&
            <Field key={index} info={info[key]} section={section} k={key}
                   setInputAdd={setInputAdd} inputAdd={inputAdd}></Field>
        ))}
    </dl>)
}


function CardComponent({info, header, section, inputAdd, setInputAdd}) {
    let body = []
    if (header === "Phenotype") {
        body.push(
            <DLRow key={body.length} info={info['Other']} section={section}
                   setInputAdd={setInputAdd}></DLRow>)
        if (section === "Submit Data") {
            body.push(<Fragment key={body.length}>
                {Object.keys(inputAdd.Phenotype).map((_, index) => (
                    <Phenotype key={index} index={index} inputAdd={inputAdd} setInputAdd={setInputAdd} info={info['Select']}></Phenotype>
                ))}
                <Button className="shadow" variant="primary"
                        onClick={() => setInputAdd({...inputAdd, Phenotype: inputAdd.Phenotype.concat({})})}>+</Button>
            </Fragment>)
        } else {
            body.push(<Container key={body.length} className={"p-0 m-0"}>
                {Object.keys(info['Timeline']).map((item, index) => (
                    <Row key={index} className="text-center align-items-center">
                        <Col xs={2}><h5>{item === "Title" ? "" : item}</h5></Col>
                        <Col xs={10}>
                            <TimeLine key={index} header={item} info={info['Timeline'][item]}/>
                        </Col>
                    </Row>
                ))}
            </Container>)
        }
    } else {
        body.push(
            <DLRow key={body.length} info={info} section={section}
                   setInputAdd={setInputAdd} inputAdd={inputAdd}/>)
        if (header === "Summary" && section !== 'Submit Data') {
            body.push(<Image
                key={body.length}
                src="https://nvlines.ircan.org/assets/mutant-cba5326aefd64dbdb9a22a20f8706602c6115945972ce5bbc5faeb22ed95c7bb.png"
                rounded
                style={{
                    width: '250px',
                    height: '250px',
                    bottom: '35px',
                    right: '200px',
                    position: 'absolute'
                }}/>)
        }
    }
    return (
        <Card className="m-auto mt-4 shadow p-3" style={{width: '90%'}} id={header}>
            <Card.Header className="h4 text-primary ps-0 border-primary">{header.replaceAll("_", " ")}</Card.Header>
            <Card.Body>
                {body}
            </Card.Body>
        </Card>
    );
}

export default CardComponent
