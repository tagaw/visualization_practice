import React, { useRef, useState } from 'react';
import Pond from './components/Pond';

function App() {
  const [numPoints, setNumPoints] = useState<number>(1);
  const numPointsRef = useRef(10);

  const targetCtRef = useRef<HTMLSpanElement>(null);


  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    if (!isNaN(val))  {
      const valClamped = Math.min(Math.max(val, 0), 500);

      numPointsRef.current = valClamped;
    } else {
      numPointsRef.current = 0;
    }
  }
  
  function handleNewCount() {
    if (numPoints == numPointsRef.current) 
      return;
    setNumPoints(numPointsRef.current);
  }


  return (
    <>
      <div className='w-full h-screen flex flex-wrap justify-center place-items-center border-4 '>
        <div className='w-250 text-center flex justify-center gap-4 mb-4'> 
          <p>Current points: {numPoints} </p>
          <p>Current food: <span ref={targetCtRef}>{100}</span></p>
        </div>
        <Pond tadpoleCt={numPoints} foodCt={100} counter={targetCtRef as React.RefObject<HTMLSpanElement>} />
        <div className='w-full flex justify-center gap-4'>
          <button className='border-2 rounded-md px-2' onClick={handleNewCount}>Update Tadpole Count</button>
          <span>
            Number of Datapoints:
            <input className='border-2 invalid:border-red-500 rounded-md ml-1' type="text" placeholder='10 (Valid 0 - 500)' pattern='^[0-9]+$' onChange={onInput}/>
          </span>
        </div>
      </div>
    </>
  )
}

export default App
