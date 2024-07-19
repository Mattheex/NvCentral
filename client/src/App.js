import './global.scss'
import './App.css';
import React, {useEffect, useState} from 'react'
import Menu from './components/menu';
import Header from './components/header'
import Table from "./components/table";
import NoMatch from "./components/no-match";

import {Route, Routes, useLocation, useNavigate, useParams} from "react-router-dom";
import Main from "./components/main";
import axios from 'axios';
import Home from "./components/Home";
import Label from "./components/Label";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


function App() {
    const routing = {
        'OBI_1000048': 'transgenic'
    }
    const [username, setUsername] = useState(localStorage.getItem('username'))
    const defaultAlert = {show: false, message: '', variant: ''}
    const [alert, setAlert] = useState(defaultAlert)

    useEffect(() => {
        const timeId = setTimeout(() => {
            setAlert(defaultAlert)
        }, 2000)

        return () => {
            clearTimeout(timeId)
        }
    }, [alert]);

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Header username={username} setUsername={setUsername} alert={alert}/>}>
                    <Route path="/" element={<Home routing={routing}/>}/>
                    <Route path="/transgenic" element={<Transgenic routing={routing}/>}/>
                    <Route path="/transgenic/:id" element={<Line/>}/>
                    <Route path="/add" element={<Add setAlert={setAlert}/>}/>
                    <Route path="*" element={<NoMatch/>}/>
                    <Route path="/all/:value" element={<SearchAll routing={routing}/>}/>
                    <Route path="/signIn" element={<Account setUsername={setUsername} setAlert={setAlert}/>}/>
                </Route>
            </Routes>
        </div>
    );
}

function Account({setUsername, setAlert}) {
    const [account, setAccount] = useState({username: "", password: ""});
    const [error, setError] = useState(false)
    const navigate = useNavigate();
    const {state} = useLocation();

    const handleChange = (field, value) => {
        setAccount(account => ({...account, ...{[field]: value}}))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post('/auth/login', account).then(res => {
            setUsername(res.data.username)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('username', res.data.username)
            localStorage.setItem('rights', res.data.rights)
            window.dispatchEvent(new Event('storage'));
            if (state === null) {
                navigate('/')
            } else {
                navigate(state.prev)
            }
            setAlert({show: true, message: 'Successfully connected', variant: 'success'})
        }).catch((e) => {
            console.log(e)
            setError(true)
        })
    }

    return (
        <div className="d-flex flex-grow-1 justify-content-center align-items-center">
            <Card className="w-50">
                <Card.Body>
                    <Card.Title>Connexion</Card.Title>
                    <Form className="m-3" onSubmit={handleSubmit}>
                        <Form.Group as={Row} className="mb-3" controlId="formUsername">
                            <Form.Label column sm={2}>Username</Form.Label>
                            <Col sm={10}>
                                <Label type="text" className={error ? 'border border-danger' : ''}
                                       value={account['username']}
                                       k='username'
                                       placeholder={"username"}
                                       handleChange={handleChange}/>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3" controlId="forPassword">
                            <Form.Label column sm={2}>Password</Form.Label>
                            <Col sm={10}>
                                <Label type="password" className={error ? 'border border-danger' : ''}
                                       value={account['password']}
                                       k='password'
                                       placeholder={"password"}
                                       handleChange={handleChange}/>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className={`mb-3 ${error ? 'd-block' : 'd-none'}`}>
                            <Col sm={{span: 10, offset: 2}}>
                                <Form.Text>
                                    bad user/password
                                </Form.Text>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Col sm={{span: 10, offset: 2}}>
                                <Button variant="primary" type="submit">Submit</Button>
                            </Col>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

function Omics({routing}) {
    const [selected, setSelected] = useState({
        '?field': 'http://purl.obolibrary.org/obo/OBI_1000048',
    });
    const [results, setResults] = useState([{}]);
    const [options, setOptions] = useState([
        {
            type: 'label',
            className: 'mb-3 mt-3',
            placeholder: 'Line name',
            field: '?Name'
        }
    ]);

    const handleChange = (field, value) => {
        setSelected(selected => ({...selected, ...{[field]: value}}))
    }

    useEffect(() => {
        axios.post('/search/omics', selected).then(res => setResults(res.data)).catch((error) => console.error('Error sending data:', error))
    }, [selected, setResults]);

    return (
        <div className="d-flex flex-row flex-grow-1">
            <Menu section={'Options'} types={options} handleChange={handleChange}></Menu>
            <Table title={'Omics'} results={results} routing={routing}></Table>
        </div>
    );
}

function SearchAll({routing}) {
    const {value} = useParams();
    const [selected, setSelected] = useState({'Value': value, '?Type': ['Mutants']});
    const [results, setResults] = useState([{}]);
    const [options, setOptions] = useState([
        {
            type: 'switch',
            label: 'Mutants',
            field: '?Type',
            checked: true,
        }
    ]);

    const handleChange = (field, value) => {
        if (field === '?Type') {
            if (value.checked) {
                value = [...selected[field], value.value]
            } else {
                value = selected[field].filter(item => item !== value.value)
            }
        }
        setSelected(selected => ({...selected, ...{[field]: value}}))
    }

    useEffect(() => {
        axios.post('/search/all', selected).then(res => setResults(res.data)).catch((error) => console.error('Error sending data:', error))
    }, [selected, setResults]);

    return (
        <div className="d-flex flex-row flex-grow-1">
            <Menu section={'Options'} types={options} handleChange={handleChange}></Menu>
            <Table title={'All'} results={results} routing={routing}></Table>
        </div>
    );
}

function Transgenic({routing}) {
    const [selected, setSelected] = useState({
        '?field': 'http://purl.obolibrary.org/obo/OBI_1000048',
        '?Type': ['Reporter', 'Functional', 'Wild']
    });

    const [results, setResults] = useState([{}]);
    const [options, setOptions] = useState([
        {
            type: 'checkbox',
            label: 'Reporter',
            field: '?Type',
            checked: true,
        }, {
            type: 'checkbox',
            label: 'Functional',
            field: '?Type',
            checked: true,
        }, {
            type: 'checkbox',
            label: 'Wild',
            field: '?Type',
            checked: true,
        }, {
            type: 'label',
            className: 'mb-3 mt-3',
            placeholder: 'Line name',
            field: '?Name'
        }, {
            type: 'label',
            className: 'mb-3 mt-3',
            placeholder: 'Gene name',
            field: '?gene_name'
        }, {
            type: 'label',
            className: 'mb-3 mt-3',
            placeholder: 'Tag name',
            field: '?Tag'
        }, {
            type: 'option',
            className: 'mb-3 mt-3',
            field: '?Lab',
            options: []
        }, {
            type: 'option',
            className: 'mb-3 mt-3',
            field: '?cell_label',
            options: []
        },
    ]);

    const handleChange = (field, value) => {
        if (field === '?Type') {
            if (value.checked) {
                value = [...selected[field], value.value]
            } else {
                value = selected[field].filter(item => item !== value.value)
            }
        }
        setSelected(selected => ({...selected, ...{[field]: value}}))
    }

    useEffect(() => {
        axios.post('/search/mutants', selected, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            setResults(res.data.data);
            //setRights(res.data.rights)
        }).catch((error) => console.error('Error sending data:', error))
    }, [selected, setResults]);

    useEffect(() => {
        fetch("search/mutants/options").then(res => res.json().then(data => {
            setOptions(options => {
                const newOptions = [...options]
                newOptions[6] = {...options[6], options: data.lab_label}
                newOptions[7] = {...options[7], options: data.cell_label}
                return newOptions
            });
        }))
    }, [setOptions]);

    return (
        <div className="d-flex flex-row flex-grow-1">
            <Menu section={'Options'} types={options} handleChange={handleChange}></Menu>
            <Table title={'Transgenic Lines'} results={results} routing={routing}></Table>
        </div>
    );
}

function Line() {
    const [info, setInfo] = useState(
        {
            Summary: {
                Line_ID: '',
                Line_name: "",
                Synonym_line_name: "",
                Line_type: "",
                Generation: "",
                Zygosity: "",
                Lab_of_origin: "",
                Status: ""
            },
            Genetic_modifications: {
                Tag_type: "",
                Molecular_tools: "",
                Vector_name: "",
                Vector_description: "",
                Construction_description: '',
                Mutation_type: '',
                Reagents_and_protocols: '',
            },
            Gene_information: {
                Name: '',
                Sequence: '',
                Promoter: '',
                "Ensembl accession number": '',
                Genbank_accession_number: '',
                NvERTx_ID: ''
            },
            Mutation: {
                "Chromosome's_number": "",
                Locus_of_insertion: "",
                Mutated_region: "",
            },
            Phenotype: {
                Other: {
                    'Sub-localization': '',
                    Cell_type: '',
                    Region_type: '',
                },
                Timeline: {
                    Title: ["Embryo stage", "Larval stage", "Metamorphosis", "Adult stage"],
                }
            },
            Genome: {
                "Genome browsers": [],
                "Genome version": ''
            },
            Publication: {
                Title: '',
                Date: '',
                Creator: '',
                Source: [],
                "Associated lines": ''
            }
        }
    );
    const {id} = useParams();

    useEffect(() => {
        fetch(`/get/line/${id}`).then(res => res.json().then(setInfo))
    }, [id, setInfo]);

    return <Main section={'read'} info={info}></Main>;
}

function Add({setAlert}) {
    const [info, setInfo] = useState({
            Summary: {Line_name: '', Line_type: [], Zygosity: []},
            Phenotype: {Select: {Phenotype: [], Stage: []}, Other: {}}
        }
    );
    const [inputAdd, setInputAdd] = useState({
        Line_name: {},
        Synonym_line_name: {},
        Line_type: {},
        Generation: {},
        Zygosity: {},
        Lab_of_origin: {},
        Status: {},
        Exp: {select: false, value: null},
        Charac: {select: false, value: null},
        Tag_type: {select: false, value: 'NA'},
        Construction_description: {},
        Mutation_type: {},
        Reagents_and_protocols: {},
        Molecular_tools: {},
        Name: {select: false, value: null},
        Sequence: {},
        Promoter: {},
        "Ensembl accession number": {},
        Genbank_accession_number: {},
        "Ensembl_ID": {},
        "Genbank_ID": {},
        NvERTx_ID: {},
        "Chromosome's_number": {},
        Locus_of_insertion: {},
        Mutated_region: {},
        'Sub-localization': {},
        Cell_type: {},
        Region_type: {},
        Phenotype: [{}],
        Version: {},
        Date_: {},
        Details: {},
        Publication: {
            Publication: [],
            Collapse: {}
        }
    });

    useEffect(() => {
        fetch(`/add`).then(res => res.json().then(setInfo))
    }, [setInfo]);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(inputAdd)

        const checkValues = (obj) => {
            for (let key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    if (!checkValues(obj[key])) {
                        return false;
                    }
                } else if (key === 'value' && typeof obj[key] === 'string') {
                    if (!/^[a-z0-9]+$/i.test((obj[key]))) {
                        return false;
                    }
                }
            }
            return true;
        }

        if (!checkValues(inputAdd)) {
            setAlert({show: true, message: 'Some data contains non alphanumeric characters', variant: 'danger'})
            return
        }
        axios.post('/add/line', inputAdd, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: localStorage.getItem('token'),
            }
        }).then(() => {
            navigate('/')
            setAlert({show: true, message: 'Successfully added data', variant: 'success'})
        }).catch((error) => {
            console.error('Error sending data:', error)
            setAlert({show: true, message: 'Error data none added', variant: 'danger'})
        })
    };

    return <Main section={'Submit Data'} info={info} handleSubmit={handleSubmit} inputAdd={inputAdd}
                 setInputAdd={setInputAdd}></Main>;
}

export default App;
