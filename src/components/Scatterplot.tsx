import { useEffect } from "react"

export type props = { data: number[][] }

export default function Scatterplot({data} : props) {

    return (
        <svg className="w-full h-full">
            {data.map((x) => (
                <circle cx={x[0]} cy={x[1]} r="5" fill="blue" />
            ))}
        </svg>
    )
}