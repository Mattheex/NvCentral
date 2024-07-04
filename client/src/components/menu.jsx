import React, {useState, useEffect} from 'react'
import Nav from 'react-bootstrap/Nav';
import ListGroup from 'react-bootstrap/ListGroup';
import {Link} from "react-router-dom";
import Button from "react-bootstrap/Button";
import Option from "./Option";
import Label from "./Label";
import CheckBox from "./CheckBox";


function Search({types, handleChange}) {
    return (<ListGroup.Item className="flex-column m-2 bg-transparent border-0">
            {types.map((field, index) => (
                ((field.type === 'checkbox' || field.type === 'switch') &&
                    <CheckBox key={index} type={field.type} label={field.label} field={field.field}
                              defaultChecked={field.checked}
                              handleChange={handleChange}/>) ||
                (field.type === 'label' &&
                    <Label key={index} className={field.className} placeholder={field.placeholder} k={field.field}
                           handleChange={handleChange}/>) ||
                (field.type === 'option' &&
                    <Option key={index} className={field.className} options={field.options} field={field.field}
                            handleChange={handleChange}/>)
            ))}
        </ListGroup.Item>
    )
}


function Navigation({cards}) {

    const [activeLink, setActiveLink] = useState("Summary");

    const onPress = (e) => {
        e.preventDefault();
        const target = window.document.getElementById(
            e.currentTarget.href.split("#")[1]
        );
        if (target) {
            const headerOffset = 70;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition - headerOffset;
            window.scrollBy({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        const determineActiveSection = () => {
            Object.keys(cards).forEach((key, _) => {
                const section = document.getElementById(key);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= 100 && rect.bottom >= 300) {
                        setActiveLink(key);
                    }
                }
            })
        }

        window.addEventListener("scroll", determineActiveSection);
    }, [cards]);


    return (
        <ListGroup.Item className="flex-column border-0 p-0">
            {Object.keys(cards).map((key, index) => (
                <Link key={index} onClick={(e) => onPress(e)}
                      to={`#${key}`} style={{textDecoration: 'none'}}>
                    <h6 className={activeLink === key ? "menu-active p-2" : "p-2"}>
                        {key.replaceAll("_", " ")}</h6>
                </Link>
            ))}
        </ListGroup.Item>
    )
}

function Menu({section, types, handleChange}) {
    let content;
    let title;
    let submitButton;

    if (section === 'Options') {
        content = <Search types={types} handleChange={handleChange}/>
        title = section
    } else {
        content = <Navigation cards={types}/>
        if (section === 'read') {
            title = types.Summary.Line_name
        } else if (section === 'Submit Data') {
            title = section
            submitButton =
                <Button className="align-self-center w-50" variant="primary" onClick={handleChange}>Submit</Button>
        }
    }

    return (
        <Nav className="d-flex flex-column shadow-left z-1 " style={{width: '260px'}}>
            <div className="d-flex flex-column justify-content-between"
                 style={{position: 'sticky', height: '85vh', top: '56px'}}>
                <ListGroup variant="flush bg-transparent">
                    <ListGroup.Item className="p-3 h6 border-0 border-bottom bg-transparent m-0">
                        {title} </ListGroup.Item>
                    {content}
                </ListGroup>
                {submitButton}
            </div>
        </Nav>
    );
}

export default Menu
