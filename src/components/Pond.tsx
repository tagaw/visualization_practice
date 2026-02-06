import React, { useEffect, useRef, useState } from "react";
import Tadpole from "./Tadpole";

export type props = { 
    tadpoleCt: number; 
    foodCt: number;
    counter: React.RefObject<HTMLSpanElement>;
};

export type foodTarget = {
    position: [number, number] | null,
    amount: number,
    id: number,
}


export default function Pond({tadpoleCt, foodCt, counter} : props) {
  const targetCt = useRef(foodCt);

  // Constants and ref to clean up animation frame
  const foodSize = Math.sqrt(tadpoleCt) * 1.25 + 5
  const foodCount = tadpoleCt*Math.ceil(0.75);

  const frameId = useRef<number | null>(null);

  // direct svg manipulation refs
  const foodRef = useRef<(SVGCircleElement | null)[]>(new Array(foodCt));
  
  // where the targets are and how much is left
  const [targetArr,setTargetArr] = useState<(foodTarget)[]>(new Array(foodCt).fill(0).map((_,i) => ({position: null, amount: foodCount, id: i}))); 

  // State to trigger rerender on tadpoles when food is dropped
  const [target, setTarget] = useState<(foodTarget)>(targetArr[0]);

  // stack for used targets that tadpoles can see
  const usedTargetStackRef = useRef<number[]>([]);

  // stack for target i that is free
  const freeTargetStackRef = useRef<number[]>(new Array(foodCt).fill(0).map((_,i) => i).reverse());

  // used to get position of click interaction
  const canvasRef = useRef<SVGSVGElement | null>(null);

  // TODO: rethink how state is managed. Simplify reset logic, too messy with mixing of pass-by-reference and pass-by-value vars
  function cleanupState() {
    targetArr.forEach((_,i) => (targetArr[i] = {position: null, amount: 0, id: i}));
    setTargetArr([...targetArr]); 
    setTarget(targetArr[0]);

    freeTargetStackRef.current.forEach((_,i) => freeTargetStackRef.current[i] = freeTargetStackRef.current.length-i-1);

    frameId.current && cancelAnimationFrame(frameId.current);
    targetCt.current = foodCt;
  }

  useEffect(() => { 
    // when tadpole count changes, reset the pond state
    cleanupState();

    return () => {
      cleanupState();
    }
  }, [tadpoleCt]);

  function dropFood(event: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    if (freeTargetStackRef.current.length > 0) { 
      const boundingBox = canvasRef.current?.getBoundingClientRect();

      const x = event.clientX - (boundingBox?.left || 0);
      const y = event.clientY - (boundingBox?.top || 0);

      const foodIndex = freeTargetStackRef.current.pop()!;
      usedTargetStackRef.current.push(foodIndex);

      targetArr[foodIndex].position = [x,y];
      targetArr[foodIndex].amount = foodCount;

      // pass by reference required
      const newTarget = targetArr[foodIndex];
      
      // triggers rerender of pond to show food, and tadpoles to add a new target
      setTargetArr([...targetArr]);
      setTarget(newTarget)
      targetCt.current -= 1;

      // direct DOM manipulation to show how many targets can be placed
      // may be a terrible anti-pattern :(
      counter.current!.innerText = targetCt.current.toString();

      foodRef.current[foodIndex]?.setAttribute("r", foodSize.toString());
      

      function foodAnimation() {
        // loop through all active food, reduce size based on amount left, free eaten food
        for (let idx of usedTargetStackRef.current) {
          if (targetArr[idx].amount! > 0) { 
            const pctFoodLeft = targetArr[idx]?.amount!/foodCount;
            foodRef.current[idx]?.setAttribute("r", (foodSize * pctFoodLeft).toString());
          } else {
            targetCt.current += 1;
            targetArr[idx].position = null;
            counter.current!.innerText = targetCt.current.toString();

            // reset food and add to free stack
            foodRef.current[idx]?.setAttribute("r", "0");
            freeTargetStackRef.current.push(idx);
          }
        }
        
        // Filter out any targets that have been fully eaten
        usedTargetStackRef.current = usedTargetStackRef.current.filter((idx) => targetArr[idx]?.amount! > 0);

        // continue animation if not all targets eaten
        if (usedTargetStackRef.current.length > 0) {
          frameId.current = requestAnimationFrame(foodAnimation);
        }

      }
      frameId.current = requestAnimationFrame(foodAnimation);
    } 
  }
    

  return (
      <>
      <div className='w-250 h-150 border-4 flex-none'>
        <svg ref={canvasRef} className='w-full h-full' onClick={dropFood}>
          {targetArr.map((obj,i) => <circle key={i} ref={(e) => {foodRef.current[i] = e; return undefined}} cx={obj?.position ? obj.position[0] : -100} cy={obj?.position ? obj.position[1] : -100} r={0} fill="brown" />)}
          {new Array(tadpoleCt).fill(0).map((_,index) => (<Tadpole key={index}  target={target}/>))}
        </svg>
      </div>
      </>
  );
}
