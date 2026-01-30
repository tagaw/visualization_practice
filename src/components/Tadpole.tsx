import React, { useEffect, useRef } from "react";
import { line } from "d3-shape";

export type props = { 
    target: React.RefObject<[number, number] | null>,
    flags: React.RefObject<{flagArr: boolean[]; flagCt: number}>, 
    id: number 
 };

// General helper functions
function getAngle(currX: number, currY: number,targetX: number, targetY: number) {
    return Math.atan2(targetY - currY, targetX - currX);
}

function updateDx(vx: number, angle: number) {
    return vx * (Math.cos(angle));
}

function updateDy(vy: number, angle: number) {
    return vy * (Math.sin(angle));
}
function genRandomSpeed() {
    let dir = Math.random() > 0.5 ? 1 : -1;
    return dir * (Math.random() + 0.5);
}

export default function Tadpole({ target, flags, id }: props) {
    // Tadpole component represents a single tadpole in the pond
    // Each tadpole object tracks its own state and animation loop
    // Animation is done using requestAnimationFrame and direct SVG manipulation

    // Communication with the pond is done through ref props
    // to avoid breaking the animation loop between rerenders

    // Tadpole Constants
    const headLength = 5;
    const tailLength = 10;
    const pathUpdateInterval = Math.random() * 150 + 100;

    // Refs for positional values. 
    // used so that animation is independent from React render cycle
    const velX = useRef(genRandomSpeed());
    const velY = useRef(genRandomSpeed());
    // these refs are used to maintain random wandering when the pond state changes (mainly when target is cleared)
    const prevVelX = useRef(velX.current); 
    const prevVelY = useRef(velY.current);

    const pathXRef = useRef<number[]>(new Array(tailLength).fill(Math.random() * 1000));
    const pathYRef = useRef<number[]>(new Array(tailLength).fill(Math.random() * 600));
    

    // SVG Element Refs for direct manipulation
    const headRef = useRef<SVGLineElement | null>(null);
    const bodyRef = useRef<SVGPathElement | null>(null);
    const tailRef = useRef<SVGPathElement | null>(null);

    // Used to track tail sway and targeting behavior
    const swayRef = useRef(0);
    const updateIntervalRef = useRef(pathUpdateInterval);

    // Helper functions to correctly draw the direction of the head
    function headXOffset() {
        return headLength * Math.cos(Math.atan2(velY.current, velX.current));
    }
    function headYOffset() {
        return headLength * Math.sin(Math.atan2(velY.current, velX.current));
    }
    
    // will run on mount/dismount
    useEffect(() => { 
        // Each tick increments the tadpole forward based on its velocity
        // If a target is set, the tadpole will adjust its velocity to move towards the target

        // d3 used to quickly generate a line from array of points
        const lineGenerator = line().x((_,i) => pathXRef.current[i]).y((_,i) => pathYRef.current[i]);

        // Record last animation frame id to cancel on unmount
        let frameId: number;

        // animation loop
        const tick = () => {    
            let dx: number, dy:number, speed:number;
            // Tadpole will check to adjust its vector at random intervals to mimic more natural movement
            // Beneficial effect of swarming target once it is reached (was the initial intention)
            
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
                } else {
                    velX.current = prevVelX.current;
                    velY.current = prevVelY.current;
                }
            }

            // update positional values
            dx = velX.current;
            dy = velY.current;

            pathXRef.current[0] += dx;
            pathYRef.current[0] += dy;

            let x = pathXRef.current[0];
            let y = pathYRef.current[0];
            speed = Math.sqrt(dx * dx + dy * dy);
            updateIntervalRef.current -= speed;

            const inc = speed * 12;
            const stretch = -7 - speed/2; // total tail length increases with speed, compensate for higher amplitude oscillations

            // bounce off walls
            // TODO: remove hardcoded pond dimensions
            if (x < 0 || x > 1000) {
                velX.current *= -1;
                if (!target.current) {
                    prevVelX.current = velX.current;
                }
            }
            if (y < 0 || y > 600) {
                velY.current *= -1;
                if (!target.current) {
                    prevVelY.current = velY.current;
                }
            }
            
            // body and tail ossillation animation, the body is simply a 'short and stubby' tail
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

            // Signal that this tadpole has reached the target
            // TODO: use a bitset to reduce memory usage, anticipate for multiple concurrent targets
            if (target.current 
                && !flags.current.flagArr[id] 
                && Math.abs(pathXRef.current[0] - target.current[0]) < 1 
                && Math.abs(pathYRef.current[0] - target.current[1]) < 1) {
                flags.current.flagArr[id] = true;
                flags.current.flagCt -= 1;
            }

            // Animate Head
            headRef.current?.setAttribute("x1", pathXRef.current[0].toString());
            headRef.current?.setAttribute("y1", pathYRef.current[0].toString());
            headRef.current?.setAttribute("x2", (pathXRef.current[0] + headXOffset()).toString());
            headRef.current?.setAttribute("y2", (pathYRef.current[0] + headYOffset()).toString());

            // Animate Body and Tail. 
            // Dummy arrays of correct length are passed to line generator to produce correct path from current position arrays
            bodyRef.current?.setAttribute("d", lineGenerator(new Array(3).fill(0))!);
            tailRef.current?.setAttribute("d", lineGenerator(new Array(tailLength).fill(0))!);

            frameId = requestAnimationFrame(tick);
        };
        
        // initial call to kick off animation on mount
        frameId = requestAnimationFrame(tick);
        return () => {
            // cleanup on unmount
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