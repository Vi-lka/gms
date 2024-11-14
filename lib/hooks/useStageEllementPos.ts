"use client"

import { useAtomValue } from "jotai";
import useWindowDimensions from "./useWindowDimensions";
import { mainImageAtom } from "../atoms/main";

export default function useStageEllementPos( 
    size: {width?: number, height?: number},
    pos: {x: number, y: number}
) {
    const { width, height } = useWindowDimensions();

    const mainImage = useAtomValue(mainImageAtom)

    const itemW = (size.width && size.width > 0) ? size.width : 1
    const itemH = (size.height && size.height > 0) ? size.height : 1

    const relativeW = (mainImage.size.width/1000)*itemW
    const relativeH = (mainImage.size.height/1000)*itemH

    const relativeX = (mainImage.size.width/1000)*pos.x
    const relativeY = (mainImage.size.height/1000)*pos.y

    /* 
      calculate the offsets so the object is centered inside
      the canvas
    */
    const xOffset = (width - relativeW) / 2;
    const yOffset = (height - relativeH) / 2;

    return ({
        size: {width: relativeW, height: relativeH},
        pos: { x: xOffset + relativeX, y: yOffset - relativeY }
    });
}