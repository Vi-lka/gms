"use client"

import { mainImageAtom } from '@/lib/atoms/main';
import useWindowDimensions from '@/lib/hooks/useWindowDimensions';
import { useSetAtom } from 'jotai';
import { Vector2d } from 'konva/lib/types'
import React, { useEffect, useState } from 'react'
import { Image as KonvaImage } from 'react-konva';
import { useImage } from 'react-konva-utils';

export type KonvaImageT = {
  width?: number,
  height?: number,
  scale?: Vector2d,
  x?: number,
  y?: number,
}


export default function MapImage(props: KonvaImageT) {
  const [image] = useImage('/images/Russia-Map.svg');

  const { width, height } = useWindowDimensions();

  const [pos, setPos] = useState({ x: 0, y: 0 });

  const setMainImage = useSetAtom(mainImageAtom)

  useEffect(() => {
    if (image) {
      /* after the image is loaded, you can get it's dimensions */
      const imgNaturalWidth = image.width;
      const imgNaturalHeight = image.height;

      /* 
        calculate the horizontal and vertical ratio of the 
        image dimensions versus the canvas dimensions
      */
      const hRatio = width / imgNaturalWidth;
      const vRatio = height / imgNaturalHeight;

      /*
        to replicate the CSS Object-Fit "contain" behavior,
        choose the smaller of the horizontal and vertical 
        ratios

        if you want a "cover" behavior, use Math.max to 
        choose the larger of the two ratios instead
      */
      const ratio = Math.min(hRatio, vRatio);
      /* 
        scale the image to fit the canvas 
      */
      image.width = imgNaturalWidth * ratio;
      image.height = imgNaturalHeight * ratio;

      /* 
        calculate the offsets so the image is centered inside
        the canvas
      */
      const xOffset = (width - image.width) / 2;
      const yOffset = (height - image.height) / 2;

      setMainImage({
        size: {width: image.width, height: image.height},
        pos: {x: xOffset, y: yOffset}
      })

      setPos({
        x: xOffset,
        y: yOffset
      });
    }
  }, [width, height, image, setMainImage]);

  return <KonvaImage x={pos.x} y={pos.y} image={image} {...props} />;
}
