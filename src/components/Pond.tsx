import React, { useRef } from "react";
import Tadpole from "./Tadpole";

export type props = { 
    data?: [number, number][]; 
};

export default function Pond({data = [[50,50]]} : props) {
    const flagsRef = useRef(new Array(data.length).fill(false));
    const targetRef = useRef<[number, number] | null>(null); 

    function updateTarget() {
      targetRef.current = [300,500];
    }

    return (
        <>
        <button className='border-2 rounded-md px-2 mb-2' onClick={updateTarget}>Set Target to (300,500)</button>
        <div className='w-250 h-150 border-4 flex-none'>
          <svg className='w-full h-full'>
            {data.map((i,index) => ( <Tadpole key={`${index}`+Date.now()} vx={.9} vy={.9} px={i[0]} py={i[1]} target={targetRef} flags={flagsRef} id={index} />))}
          </svg>
        </div>
        </>
    );
}
