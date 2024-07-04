import Menu from "./menu";
import CardComponent from "./cardComponent";

function Main({section, info, handleSubmit, inputAdd, setInputAdd}) {
    return (
        <div className="d-flex flex-row flex-grow-1">
            <Menu section={section} types={info} handleChange={handleSubmit}></Menu>
            <div className="container-fluid p-0 tableColor">
                {Object.keys(info).map((key, index) => (
                    <CardComponent key={index} info={info[key]} header={key} section={section} inputAdd={inputAdd}
                                   setInputAdd={setInputAdd}></CardComponent>
                ))}
            </div>
        </div>
    );
}

export default Main
