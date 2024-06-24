import './global.scss'
import './App.css';
import React, {useEffect, useState} from 'react'
import Menu from './components/menu';
import Header from './components/header'
import Table from "./components/table";
import NoMatch from "./components/no-match";

import {Routes, Route, useParams} from "react-router-dom";
import Main from "./components/main";
import axios from 'axios';
import Home from "./components/Home";

function App() {
    const routing = {
        'OBI_1000048': 'transgenic'
    }
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Header/>}>
                    <Route path="/" element={<Home routing={routing}/>}/>
                    <Route path="/transgenic" element={<Transgenic routing={routing}/>}/>
                    <Route path="/transgenic/:id" element={<Line/>}/>
                    <Route path="/add" element={<Add/>}/>
                    <Route path="*" element={<NoMatch/>}/>
                    <Route path="/all/:value" element={<SearchAll routing={routing}/>}/>
                    <Route path="/omics" element={<Omics routing={routing}/>}/>
                </Route>
            </Routes>
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
        axios.post('/post/omics', selected).then(res => setResults(res.data)).catch((error) => console.error('Error sending data:', error))
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
        axios.post('/post/searchAll', selected).then(res => setResults(res.data)).catch((error) => console.error('Error sending data:', error))
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
        axios.post('/post/option', selected).then(res => setResults(res.data)).catch((error) => console.error('Error sending data:', error))
    }, [selected, setResults]);

    useEffect(() => {
        fetch("/api/option").then(res => res.json().then(data => {
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
                Lab_of_origin: ""
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
        fetch(`/line/${id}`).then(res => res.json().then(setInfo))
    }, [id, setInfo]);

    return <Main section={'read'} info={info}></Main>;
}

function Add() {
    const [info, setInfo] = useState({
            Summary: {Line_name: '', Line_type: [], Zygosity: []},
            Phenotype: {Timeline: {}, Other: {}}
        }
    );
    const [inputAdd, setInputAdd] = useState({
        Line_name: {},
        Synonym_line_name: {},
        Line_type: {},
        Generation: {},
        Zygosity: {},
        Lab_of_origin: {},
        Exp: {select: false, value: ''},
        Charac: {select: false, value: ''},
        Tag_type: {},
        Molecular_tools: {},
        Vector_name: {},
        Name: {},
        Sequence: {},
        Promoter: {},
        "Ensembl accession number": {},
        Genbank_accession_number: {},
        NvERTx_ID: {},
        "Genome version": {},
        "Chromosome's_number": {},
        Locus_of_insertion: {},
        Mutated_region: {},
        'Sub-localization': {},
        Cell_type: {},
        Region_type: {},
        Phenotype: []
    });
    const [selectPhen, setSelectPhen] = useState([])
    const [selectStage, setSelectStage] = useState([])


    useEffect(() => {
        fetch(`/add`).then(res => res.json().then(setInfo))
        fetch(`/add/Stage`).then(res => res.json().then(setSelectStage))
        fetch(`/add/Phenotype`).then(res => res.json().then(setSelectPhen))
    }, [setInfo, setSelectStage, setSelectPhen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        axios.post('/post/add', inputAdd).then().catch((error) => console.error('Error sending data:', error))
    };

    return <Main section={'Submit Data'} info={info} handleSubmit={handleSubmit} inputAdd={inputAdd}
                 setInputAdd={setInputAdd} selectPhen={selectPhen} selectStage={selectStage}></Main>;
}

export default App;
