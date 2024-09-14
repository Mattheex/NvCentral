import React, { Fragment, useEffect, useState } from "react";
import Nav from "react-bootstrap/Nav";
import ListGroup from "react-bootstrap/ListGroup";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Option from "./Option";
import Label from "./Label";
import CheckBox from "./CheckBox";
import Stack from "react-bootstrap/esm/Stack";

function Search({ types, handleChange }) {
  return (
    <Stack className="m-3">
      {types.map((field, index) => (
        <Fragment key={index}>
          {((field.type === "checkbox" || field.type === "switch") && (
          <CheckBox
            type={field.type}
            label={field.label}
            field={field.field}
            defaultChecked={field.checked}
            handleChange={handleChange}
          />
          )) || (field.type === "label" && (
          <Label
            className={field.className}
            placeholder={field.placeholder}
            k={field.field}
            handleChange={handleChange}
          />
          )) || (field.type === "option" && (
          <Option
            className={field.className}
            options={field.options}
            field={field.field}
            handleChange={handleChange}
          />
          ))}
        </Fragment>
      ))}
    </Stack>
  );
}

function Navigation({ cards }) {
  const [activeLink, setActiveLink] = useState("Summary");

  const onPress = (e) => {
    e.preventDefault();
    const target = window.document.getElementById(e.currentTarget.href.split("#")[1]);
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
      });
    };

    window.addEventListener("scroll", determineActiveSection);
  }, [cards]);

  return (
    <Nav className="flex-column" as="ul">
      {Object.keys(cards).map((key, index) => (
        <Nav.Item key={index} as="li">
          <Nav.Link
            className={`${activeLink === key ? "menu-active" : ""}`}
            href={`#${key}`}
            onClick={(e) => onPress(e)}
            style={{color: "var(--bs-heading-color)"}}
          >
            {key.replaceAll("_", " ")}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
}

function Menu({ section, types, handleChange }) {
  let content;
  let title;
  let submitButton;

  if (section === "Options") {
    content = <Search types={types} handleChange={handleChange} />;
    title = section;
  } else {
    content = <Navigation cards={types} />;
    if (section === "read") {
      title = types.Summary.Line_name;
    } else if (section === "Submit Data") {
      title = section;
      submitButton = (
        <Button className="align-self-center w-50" variant="primary" onClick={handleChange}>
          Submit
        </Button>
      );
    } else if (section === "accept") {
      title = types.Summary.Line_name;
      submitButton = (
        <div className="d-flex align-self-center">
          <Button className="me-1" variant="primary" onClick={handleChange}>
            Accept
          </Button>
          <Button className="ms-1" variant="danger" onClick={handleChange}>
            Delete
          </Button>
        </div>
      );
    }
  }

  return (
    <Stack
      className="shadow-left z-0 bg-white"
      style={{ width: "220px", position: "fixed", top: "56px",bottom:0 }}>
      <h5 className="p-3 border-bottom m-0">{title}</h5>
      {content}
      {submitButton}
    </Stack>
  );
}

export default Menu;
