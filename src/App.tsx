import { useEffect, useRef, useState, type JSX } from 'react';
import Pond from './components/Pond';

export type props = {
  pond: JSX.Element;
}

function App() {
  const [data, setData] = useState<[number,number][]>([]);
  const [numPoints, setNumPoints] = useState<number>(10);
  const numPointsRef = useRef(10);

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    if (!isNaN(val))  {
      const valClamped = Math.min(Math.max(val, 0), 1000);

      numPointsRef.current = valClamped;
    } else {
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
    setNumPoints(numPointsRef.current);
    
  }

  useEffect(() => {
    genData();
  }, []);
  
  return (
    <>
      <div className='w-full h-screen flex flex-wrap justify-center place-items-center border-4 '>
        <div className='w-250 text-center'> Current points: {numPoints} </div>
          <Pond data={data} />
          <button className='border-2 rounded-md px-2' onClick={genData}>Generate New Dataset</button>
          <span>
            Number of Datapoints:
            <input className='border-2 invalid:border-red-500 rounded-md ml-1' type="text" placeholder='10 (Valid 0 - 1000)' pattern='^[0-9]+$' onChange={onInput}/>
          </span>
        </div>
    </>
  )
}

export default App
