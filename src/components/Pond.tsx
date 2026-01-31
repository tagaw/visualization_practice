import React, { useEffect, useRef, useState } from "react";
import Tadpole from "./Tadpole";

export type props = { 
    tadpoleCt: number; 
};


export default function Pond({tadpoleCt} : props) {
  // TODO: make tadpoles reactive to Pond state

  // Constants and ref to clean up animation frame
  const foodSize = Math.sqrt(tadpoleCt) * 1.25 + 5
  const foodCount = tadpoleCt*Math.ceil(2.25);

  const frameId = useRef<number | null>(null);


  // Food and its state | ref is used for direct SVG manipulation for performance 
  const foodRef = useRef<SVGCircleElement | null>(null);
  const [foodX, setFoodX] = useState<number>(-100);
  const [foodY, setFoodY] = useState<number>(-100);

  // refs to allow tadpoles to update pond state
  // TODO: make use of state (maybe?)
  const foodFlagRef = useRef<number>(foodCount);
  const [target,setTarget] = useState<[number, number] | null>(null); 

  // used to get position of click interaction
  const canvasRef = useRef<SVGSVGElement | null>(null);
  

  function cleanupState() {
    setTarget(null);
    foodRef.current?.setAttribute("r", "0");
    foodFlagRef.current = foodCount;
    frameId.current && cancelAnimationFrame(frameId.current);
  }

  useEffect(() => { 
    // when tadpole count changes, reset the pond state
    cleanupState();

    return () => {
      cleanupState();
    }
  }, [tadpoleCt]);

  function dropFood(event: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    if (!target) {
      const boundingBox = canvasRef.current?.getBoundingClientRect();

      const x = event.clientX - (boundingBox?.left || 0);
      const y = event.clientY - (boundingBox?.top || 0);

      setTarget([x, y]);
      // direct dom manipulation to scale down food circle
      setFoodX(x);
      setFoodY(y);

      foodRef.current?.setAttribute("r", foodSize.toString());
      function foodAnimation() {
          if (foodFlagRef.current > 0) {
            const pctEaten = foodFlagRef.current/foodCount;
            foodRef.current?.setAttribute("r", (foodSize * (pctEaten)).toString());
            frameId.current = requestAnimationFrame(foodAnimation);
          } else {
            setTarget(null);
            foodRef.current?.setAttribute("r", "0");
            foodFlagRef.current = foodCount;
          }
      }
      frameId.current = requestAnimationFrame(foodAnimation);
    } 
  }
    

  return (
      <>
      <div className='w-250 h-150 border-4 flex-none'>
        <svg ref={canvasRef} className='w-full h-full' onClick={dropFood}>
          <circle ref={foodRef} cx={foodX} cy={foodY} r={0} fill="brown" />
          {new Array(tadpoleCt).fill(0).map((_,index) => (<Tadpole key={index}  target={target} flags={foodFlagRef}/>))}
        </svg>
      </div>
      </>
  );
}
