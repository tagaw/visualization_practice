import React, { useEffect, useRef } from "react";
import Tadpole from "./Tadpole";

export type props = { 
    tadpoleCt: number; 
};

type pondFlagType = {
    flagArr: boolean[];
    flagCt: number
}

export default function Pond({tadpoleCt} : props) {

    const flagsRef = useRef<pondFlagType>({flagArr: new Array(tadpoleCt).fill(false), flagCt: tadpoleCt});
    const targetRef = useRef<[number, number] | null>(null); 

    const canvasRef = useRef<SVGSVGElement | null>(null);
    const foodRef = useRef<SVGCircleElement | null>(null);

    const foodSize = Math.sqrt(tadpoleCt) * 1.25 + 5;
    const foodDecrement = foodSize / tadpoleCt;

    const frameId = useRef<number | null>(null);

    const [state, setState] = React.useState<number>(0); 

    function cleanupState() {
      targetRef.current = null;
      foodRef.current?.setAttribute("r", "0");
      flagsRef.current = {flagArr: new Array(tadpoleCt).fill(false), flagCt: tadpoleCt};
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
      if (!targetRef.current) {
        const boundingBox = canvasRef.current?.getBoundingClientRect();

        const x = event.clientX - (boundingBox?.left || 0);
        const y = event.clientY - (boundingBox?.top || 0);

        targetRef.current = [x, y];
        
        // Create an animation to clear the target
        foodRef.current?.setAttribute("r", foodSize.toString());
        foodRef.current?.setAttribute("cx", x.toString());
        foodRef.current?.setAttribute("cy", y.toString());
        

        function foodAnimation() {
           if (flagsRef.current.flagCt > 0) {
              const tadpolesEaten = tadpoleCt - flagsRef.current.flagCt;
              foodRef.current?.setAttribute("r", (foodSize - (tadpolesEaten * foodDecrement)).toString());
              frameId.current = requestAnimationFrame(foodAnimation);
           } else {
              targetRef.current = null;
              foodRef.current?.setAttribute("r", "0");
              flagsRef.current.flagArr = flagsRef.current.flagArr.map(() => false);
              flagsRef.current.flagCt = tadpoleCt;
           }
        }

        frameId.current = requestAnimationFrame(foodAnimation);
      } 
    }
     

    return (
        <>
        <button onClick={() => setState(state+1)}>ffff</button>
        <div className='w-250 h-150 border-4 flex-none'>
          <svg ref={canvasRef} className='w-full h-full' onClick={dropFood}>
            <circle ref={foodRef} r={0} fill="brown" />
            {new Array(tadpoleCt).fill(0).map((_,index) => (<Tadpole key={index}  target={targetRef} flags={flagsRef} id={index} />))}
          </svg>
        </div>
        </>
    );
}
