import React, { useEffect, useRef, useState } from "react";
import { line } from "d3-shape";
import { path } from "d3";

export type props = { 
    vx: number, 
    vy: number, 
    px: number, 
    py: number, 
    target: React.RefObject<[number, number] | null>,
    flags: React.RefObject<boolean[]>, 
    id: number 
 };

function getAngle(currX: number, currY: number,targetX: number, targetY: number) {
    return Math.atan2(targetY - currY, targetX - currX);
}

function updateDx(vx: number, angle: number) {
    return vx * (Math.cos(angle));
}

function updateDy(vy: number, angle: number) {
    return vy * (Math.sin(angle));
}

export default function Tadpole({ vx, vy, px, py, target, flags, id }: props) {
    const headLength = 5;
    const tailLength = 15;
    const pathUpdateInterval = Math.random() * 150 + 100;

    const velX = useRef(vx);
    const velY = useRef(vy);
    
    const headRef = useRef<SVGLineElement | null>(null);
    const bodyRef = useRef<SVGPathElement | null>(null);
    const tailRef = useRef<SVGPathElement | null>(null);

    const pathXRef = useRef<number[]>(new Array(tailLength).fill(px));
    const pathYRef = useRef<number[]>(new Array(tailLength).fill(py));

    const swayRef = useRef(0);
    const updateIntervalRef = useRef(pathUpdateInterval);


    function headXOffset() {
        return headLength * Math.cos(Math.atan2(velY.current, velX.current));
    }
    function headYOffset() {
        return headLength * Math.sin(Math.atan2(velY.current, velX.current));
    }
    
    useEffect(() => { 
        const lineGenerator = line().x((d,i) => pathXRef.current[i]).y((d,i) => pathYRef.current[i]);

        let frameId: number;

        const tick = () => {    
            let dx: number, dy:number, speed:number;
            if (updateIntervalRef.current <= 0) {
                updateIntervalRef.current = pathUpdateInterval;
                if (target.current) {
                    dx = velX.current;
                    dy = velY.current;
                    
                    speed = Math.sqrt(dx * dx + dy * dy);

                    const [tx, ty] = target.current;
                    const angleToTarget = getAngle(pathXRef.current[0], pathYRef.current[0], tx, ty);
                    
                    velX.current = updateDx(speed, angleToTarget);
                    velY.current = updateDy(speed, angleToTarget);

                }
            }

            dx = velX.current;
            dy = velY.current;

            pathXRef.current[0] += dx;
            pathYRef.current[0] += dy;

            let x = pathXRef.current[0];
            let y = pathYRef.current[0];
            speed = Math.sqrt(dx * dx + dy * dy);
            updateIntervalRef.current -= speed;


            const inc = speed * 12;
            const stretch = -5- speed/5;


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
                const oscillation = Math.sin((swayRef.current + i * 10) / 700) / (speed);

                x += dx / speed * stretch;
                y += dy / speed * stretch;

                pathXRef.current[i] = x - dy * oscillation;
                pathYRef.current[i] = y + dx * oscillation;

                dx = vx;
                dy = vy;
                
                speed = Math.sqrt(dx * dx + dy * dy);
            }
            
            if (target.current && !flags.current[id]) {
                // Signal that this tadpole has reached the target
                flags.current[id] = true;
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