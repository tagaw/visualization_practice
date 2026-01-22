import { useRef, useState } from "react";
import { useInterval } from "usehooks-ts";

export type props = { vx: number, vy: number, px: number, py: number };

export default function Tadpole({ vx, vy, px, py }: props) {
    const [[posX, posY], setPos] = useState<number[]>([px, py]);

    const velX = useRef(vx);
    const velY = useRef(vy);

    const headLength = 7;

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

    useInterval(() => {
        if (posX + velX.current <= 0 || posX + velX.current >= 1000) {
            velX.current *= -1;
        }

        if (posY + velY.current <= 0 || posY + velY.current >= 600) {
            velY.current *= -1
        }
        setPos([posX + velX.current, posY + velY.current]);



    }, 40);

    return (
        <>
            <line x1={posX} y1={posY} x2={posX + headXOffset()} y2={posY + headYOffset()} stroke="green" strokeLinecap="round" strokeWidth="30" />
            <line x1={posX} y1={posY} x2={posX + bodyXOffset()} y2={posY + bodyYOffset()} stroke='green' strokeLinecap="round" strokeWidth={10} />
            <line x1={posX} y1={posY} x2={posX + tailXOffset()} y2={posY + tailYOffset()} stroke="green" strokeLinecap="round" strokeWidth={3} />
            
        </>
    )
}