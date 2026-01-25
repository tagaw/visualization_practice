import { useRef, useState } from 'react';
import { line } from 'd3';
import Scatterplot from './components/Scatterplot';
import Tadpole from './components/Tadpole';

function App() {
  const [data, setData] = useState<[number,number][]>([[50,50]]);
  const [numPoints, setNumPoints] = useState<number>(10);
  const numPointsRef = useRef(10);

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    if (!isNaN(val))  {
      const valClamped = Math.min(Math.max(val, 0), 1000);
      setNumPoints(valClamped);

      numPointsRef.current = valClamped;
    } else {
      setNumPoints(0);
      numPointsRef.current = 0;
    }
  }
  
  function genData() {
    const newData: [number,number][] = [];
    for (let i = 0; i < numPointsRef.current; i++) {
      const x = Math.floor(Math.random() * 1000);
      const y = Math.floor(Math.random() * 600);
      newData.push([x,y]);
    }
    setData(newData);
    
  }

  
  return (
    <>
      <div className='w-full h-screen flex flex-wrap justify-center place-items-center border-4 '>
        <div className='w-250 text-center'> Current points: {numPoints} </div>
        <div className='w-250 h-150 border-4 flex-none'>
          <svg className='w-full h-full'>
            {data.map((i,index) => ( <Tadpole key={`${index}`+Date.now()} vx={Math.random()*2} vy={Math.random()*2} px={i[0]} py={i[1]} />))}
          </svg>
        </div>
        <div className='w-fit min-w-1/4 h-fit flex justify-between gap-4'>
          <button className='border-2 rounded-md px-2' onClick={genData}>Generate New Dataset</button>
          <span>
            Number of Datapoints:
            <input className='border-2 invalid:border-red-500 rounded-md ml-1' type="text" placeholder='10 (Valid 0 - 1000)' pattern='^[0-9]+$' onChange={onInput}/>
          </span>
        </div>
      </div>
    </>
  )
}

export default App
