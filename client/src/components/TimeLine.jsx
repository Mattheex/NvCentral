import {useRef, useState} from "react";
import * as d3 from "d3";

function TimeLine({header, info}) {
    const width = 800;
    let height = 70;
    if (header === "Title"){
        height = 100
    }
    const margin = {top: 20, right: 40, bottom: 20, left: 40};
    const innerWidth = width - margin.right - margin.left;
    //const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
        .domain([0, 3])
        .range([margin.left, innerWidth])

    const colorScale = d3.scaleLinear()
        .domain([0, 1])
        .range(['green', 'red']);

    const tooltip = useRef(null)
    const tooltipText = useRef(null)
    const [lethal, setLethal] = useState(null)

    const handleMouseOver = (x, y1, lethal, type) => {
        const size = 80
        const half = size / 2
        const y = y1 - 25
        let element = tooltip.current
        element.setAttribute('points', `${x - half + 10},${y}
                    ${size + x - half + 10},${y}
                    ${size + x - half + 10},${y + 20}
                    ${44 + x - half + 10},${y + 20}
                    ${half + x - half + 10},${y + 25}
                    ${36 + x - half + 10},${y + 20}
                    ${x - half + 10} ,${y + 20}`)

        element = tooltipText.current
        element.setAttribute("x", `${x + 10}`)
        element.setAttribute("y", `${y + 15}`)

        setLethal(`${lethal}`)
    }

    const handleMouseOut = () => {
        tooltip.current.setAttribute("points", "0,0")
        setLethal(null)
    }

    //console.log(header, info)

    return (
        <svg id="svgRef" className="" viewBox={`0 0 ${width} ${height}`}>
            {header === "Title" ? (<>
                    {info.map((item, index) =>
                        <text
                            key={index}
                            transform={'translate( ' + (xScale(index) + 10) + ' , ' + (height / 2 + 45) + '),' + 'rotate(-45)'}
                            style={{textAnchor: "start"}}>{item}</text>
                    )}
                </>) :
                (<>
                    <rect x={margin.left - 40} y={height / 2} width={innerWidth + 60} height={1} fill="#BBBBBB"/>
                    <polygon
                        points={`${innerWidth + 60},${height / 2 - 5} ${innerWidth + 70},${height / 2} ${innerWidth + 60},${height / 2 + 5}`}
                        fill="#BBBBBB"/>
                    {info.map((stage, index) =>
                        <rect key={index} x={xScale(stage.id)} y={height / 2 - 10} width={20} height={20}
                              fill={colorScale(stage.number)}
                              onMouseOver={() => handleMouseOver(xScale(stage.id), height / 2 - 10, stage.data, header)}
                              onMouseOut={() => handleMouseOut()}/>
                    )}
                    <polygon ref={tooltip} stroke="#BBBBBB" fill="white" pointerEvents="none"/>
                    <text ref={tooltipText} style={{textAnchor: "middle"}}>{lethal}</text>
                </>)
            }
        </svg>
    )
}

export default TimeLine
