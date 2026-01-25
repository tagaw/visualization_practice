import { use, useEffect, useRef, useState } from "react";
import { curveBasis, line, path } from "d3";

export type props = { vx: number, vy: number, px: number, py: number };

export default function Tadpole({ vx, vy, px, py }: props) {
    const headLength = 5;
    const tailLength = 15;

    const velX = useRef(vx);
    const velY = useRef(vy);
    
    const headRef = useRef<SVGLineElement | null>(null);
    const bodyRef = useRef<SVGPathElement | null>(null);
    const tailRef = useRef<SVGPathElement | null>(null);

    const pathXRef = useRef<number[]>(new Array(tailLength).fill(px));
    const pathYRef = useRef<number[]>(new Array(tailLength).fill(py));

    const swayRef = useRef(0);

    

    function headXOffset() {
        return headLength * Math.cos(Math.atan2(velY.current, velX.current));
    }
    function headYOffset() {
        return headLength * Math.sin(Math.atan2(velY.current, velX.current));
    }
    function tailXOffset() {
        return -75 * Math.cos(Math.atan2(velY.current, velX.current));
    }
    function tailYOffset() {
        return -75 * Math.sin(Math.atan2(velY.current, velX.current));
    }
    function bodyXOffset() {
        return -15 * Math.cos(Math.atan2(velY.current, velX.current));
    }
    function bodyYOffset() {
        return -15 * Math.sin(Math.atan2(velY.current, velX.current));
    }
    
    useEffect(() => { 
        const lineGenerator = line().x((d,i) => pathXRef.current[i]).y((d,i) => pathYRef.current[i]);

        let frameId: number;

        const tick = () => {    
            let dx = velX.current;
            let dy = velY.current;

            pathXRef.current[0] += dx;
            pathYRef.current[0] += dy;

            let x = pathXRef.current[0];
            let y = pathYRef.current[0];
            let speed = Math.sqrt(dx * dx + dy * dy);

            const inc = speed * 10;
            const stretch = -5 - speed / 3;


            if (x < 0 || x > 1000) {
                velX.current *= -1;
            }
            if (y < 0 || y > 600) {
                velY.current *= -1;
            }
            
            for (let i = 1; i < tailLength; i++) {
                const vx = x - pathXRef.current[i];
                const vy = y - pathYRef.current[i];
                swayRef.current += inc
                const oscillation = Math.sin((swayRef.current + i * 3) / 1000) / (speed);
                pathXRef.current[i] = (x += dx / speed * stretch) - dy * oscillation;
                pathYRef.current[i] = (y += dy / speed * stretch) + dx * oscillation;
                speed = Math.sqrt((dx = vx) * dx + (dy = vy) * dy);
            }


            // Animate Head
            headRef.current?.setAttribute("x1", pathXRef.current[0].toString());
            headRef.current?.setAttribute("y1", pathYRef.current[0].toString());
            headRef.current?.setAttribute("x2", (pathXRef.current[0] + headXOffset()).toString());
            headRef.current?.setAttribute("y2", (pathYRef.current[0] + headYOffset()).toString());

            // Animate Body
            bodyRef.current?.setAttribute("d", lineGenerator(new Array(3).fill(0))!);

            tailRef.current?.setAttribute("d", lineGenerator(new Array(tailLength).fill(0))!);

            frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, []);

    

    return (
        <>
            <line ref={headRef} stroke="green" strokeLinecap="round" strokeWidth="20" />
            <path ref={bodyRef} stroke="green" strokeLinecap="round" strokeWidth={10} fill="none"/>
            <path ref={tailRef} stroke="green" strokeLinecap="round" strokeWidth={4} fill="none"/>
        </>
    )
}