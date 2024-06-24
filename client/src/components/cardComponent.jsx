import {useEffect, useState} from "react";
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import {Fragment} from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import TimeLine from "./TimeLine";
import ListGroup from "react-bootstrap/ListGroup";
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Option from "./Option";
import Label from "./Label";
import Collapse from 'react-bootstrap/Collapse';


function SearchResultList({result, k, handleChange}) {
    return (
        <ListGroup className="shadow rounded position-absolute z-1" variant="flush">
            {(result.map((item, key) => (
                <ListGroup.Item key={key} action
                                onClick={() => handleChange(k, item.label, item.node)}>{item.label}</ListGroup.Item>
            )))}
        </ListGroup>
    )
}

function SimpleLabel({info, k, setInputAdd}) {
    const [inputValue, setInputValue] = useState('')
    const [result, setResult] = useState([]);
    const [other, setOther] = useState(false);

    const Search = (field, value) => {
        handleChangeValue(field, value)
        if (value.length > 0) {
            fetch(`/add/${field}/${value}`).then(res => res.json().then(setResult))
        } else {
            setResult([])
        }
    }

    const handleChangeSelect = (field, node) => {
        setInputAdd(inputAdd => ({...inputAdd, ...{[field]: {select: true, value: node}}}))
        setOther(node === 'Autre')
    }

    const handleChangeValue = (field, label) => {
        setInputValue(label)
        setInputAdd(inputAdd => ({...inputAdd, ...{[field]: {select: false, value: label}}}))
    }

    const handleChange = (field, label, node) => {
        handleChangeSelect(field, node)
        setInputValue(label)
        setResult([])
    }

    const handleBlur = (e) => {
        if (e.relatedTarget === null || e.relatedTarget.className !== 'list-group-item list-group-item-action') {
            setResult([])
        }
    }

    let label;
    if (Array.isArray(info)) {
        label = <>
            <Option options={info} field={k} handleChange={handleChangeSelect}/>
            <Collapse in={other}>
                    <div style={{marginTop: '0.5rem'}}>
                        <Label value={inputValue} k={k} onChange={handleChangeValue}/>
                    </div>
            </Collapse>
        </>
    } else if (info === 'date') {
        label = <Label value={inputValue} k={k} handleChange={handleChangeValue} type={"data"}/>
    } else if (info === 'textarea') {
        label = <Label value={inputValue} k={k} handleChange={handleChangeValue} rows={6} as={'textarea'}/>;
    } else {
        label = <>
            <Label value={inputValue} k={k} handleChange={Search} handleBlur={handleBlur}></Label>
            {result.length > 0 &&
                <SearchResultList result={result} k={k} handleChange={handleChange}></SearchResultList>}
        </>
    }

    return label
}

function Field({info, section, k, setInputAdd}) {
    let field;
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
            <dt className="col-sm-3">{k.replaceAll("_", " ")}</dt>
            <dd className="col-sm-9">{field}</dd>
        </>
    );
}

function Phenotype({index, inputAdd, setInputAdd, selectPhen, selectStage}) {
    const [phen, setPhen] = useState({stage: '', phenotype: '', value: ''})
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        const items = {...inputAdd}
        items['Phenotype'][index] = phen
        setInputAdd(items)
    }, [phen]);

    const handleChange = (field, value) => {
        setPhen(phen => ({...phen, ...{[field.toLowerCase()]: value}}))
        if (field === 'value') {
            setInputValue(value)
        }
    }

    return (
        <InputGroup className="mb-3">
            <Option options={selectPhen} field={'Stage'} handleChange={handleChange}></Option>
            <Option options={selectStage} field={'Phenotype'} handleChange={handleChange}></Option>
            <Label value={inputValue} k={'value'} onChange={handleChange}/>
        </InputGroup>
    )
}

function DLRow({info, section, inputAdd, setInputAdd}) {
    return (<dl className="row align-self-center">
        {Object.keys(info).map((key, index) => (
            info[key] !== 'add' &&
            <Field key={index} info={info[key]} section={section} k={key} inputAdd={inputAdd}
                   setInputAdd={setInputAdd}></Field>
        ))}
    </dl>)
}


function CardComponent({info, header, section, inputAdd, setInputAdd, selectPhen, selectStage}) {
    let body = []
    const [phen, setPhen] = useState(1);

    if (header === "Phenotype") {
        body.push(<DLRow key={body.length} info={info['Other']} section={section} inputAdd={inputAdd}
                         setInputAdd={setInputAdd}></DLRow>)
        if (section === "Submit Data") {
            body.push(<Fragment key={body.length}>
                {[...Array(phen)].map((key, index) => (
                    <Phenotype key={index} index={index} inputAdd={inputAdd} setInputAdd={setInputAdd}
                               selectStage={selectStage} selectPhen={selectPhen}></Phenotype>
                ))}
                <Button className="shadow" variant="primary" onClick={() => setPhen(phen + 1)}>+</Button>
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
        body.push(<DLRow key={body.length} info={info} section={section} setInputAdd={setInputAdd}/>)
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
