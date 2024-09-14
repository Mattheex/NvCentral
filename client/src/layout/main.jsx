import Menu from "../components/menu";
import CardComponent from "../components/cardComponent";
import Container from "react-bootstrap/Container";
import Table from "../components/table";
import Stack from "react-bootstrap/Stack";

function Main({ section, info, handleChangeMenu, inputAdd, setInputAdd, handleChangeTable, results, title }) {
  return (
    <div className="d-flex flex-grow-1">
      <Menu section={section} types={info} handleChange={handleChangeMenu}></Menu>
      <Container className="tableColor overflow-auto " style={{ marginLeft: "220px" }}>
        {section !== "Options" &&
          Object.keys(info).map((key, index) => (
            <CardComponent
              key={index}
              info={info[key]}
              header={key}
              section={section}
              inputAdd={inputAdd}
              setInputAdd={setInputAdd}
            ></CardComponent>
          ))}
        {section === "Options" && (
          <>
            <Stack direction="horizontal" className="justify-content-between p-3 border-bottom">
              <h5 className="m-0">{title}</h5>
              <span>{results.length} Results</span>
            </Stack>
            {results.length === 0 && <div className="text-center">Nothing to display</div>}
            {results.length !== 0 && <Table results={results} handleChange={handleChangeTable} />}
          </>
        )}
      </Container>
    </div>
  );
}

export default Main;
