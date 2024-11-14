"use client"

import { Button } from '@/components/ui/button'
import { stageAtom, stageRefAtom } from '@/lib/atoms/main'
import useStageEllementPos from '@/lib/hooks/useStageEllementPos'
import useWindowDimensions from '@/lib/hooks/useWindowDimensions'
import getGroupAverage from '@/lib/intersections/get-group-average'
import { IntersectionGroupT } from '@/lib/intersections/get-intersections'
import valueFromWindowWidth from '@/lib/intersections/valueFromWindowWidth'
import { useAtom, useAtomValue } from 'jotai'
import React, { useRef } from 'react'
import { Html } from 'react-konva-utils'

export default function GroupItem({
  data,
}: {
  data: IntersectionGroupT,
}) {

  const ref = useRef<HTMLButtonElement>(null);

  const [stage, setStage] = useAtom(stageAtom);
  const stageRef = useAtomValue(stageRefAtom)

  const { width: windowW } = useWindowDimensions();

  const MIN_SCALE = valueFromWindowWidth({
    windowW,
    w1024: 0.9,
    w425: 0.9,
    minw: 1,
  })
  const MAX_SCALE = valueFromWindowWidth({
    windowW,
    w1024: 4,
    w425: 15,
    minw: 20,
  })

  const { width, height, x, y } = getGroupAverage(data.items)

  const {size, pos} = useStageEllementPos(
    {width, height},
    {x, y}
  )

  const handleScaleTo = () => {
    if (stageRef && ref.current) {
      const box = ref.current.getClientRects();

      const rectItem = box.item(0)

      if (rectItem) {
        const scaleBy = Math.min(stageRef.width() / rectItem.width, stageRef.height() / rectItem.height) / 2;
        console.log(scaleBy)
        const oldScale = stageRef.scaleX(); 
        const newScale =  oldScale * scaleBy 

        const mousePointTo = {
          x: rectItem.x / oldScale - stageRef.x() / oldScale,
          y: rectItem.y / oldScale - stageRef.y() / oldScale
        };
  
        let boundedScale = newScale;
        if (newScale < MIN_SCALE) boundedScale = MIN_SCALE;
        if (newScale > MAX_SCALE) boundedScale = MAX_SCALE;
  
        const x = (rectItem.x / boundedScale - mousePointTo.x) * boundedScale
        const y = (rectItem.y / boundedScale - mousePointTo.y) * boundedScale
  
        const childrenScale = valueFromWindowWidth({
          windowW: width,
          w1024: 1.2/boundedScale,
          w425: 1.8/boundedScale,
          minw: 2.4/boundedScale,
        })
  
        stageRef.children.forEach(lr => {
          if (lr.attrs.id !== "main-image") {
            lr.children.forEach(grp => {
              grp.to({
                scaleX: childrenScale,
                scaleY: childrenScale,
                duration: 0.3
              })
            })
          }
        })
  
        stageRef.to({
          width: stageRef.width(),
          height: stageRef.height(),
          scaleX: boundedScale,
          scaleY: boundedScale,
          x,
          y,
          onFinish: () => {
            setStage({
              width: stageRef.width(),
              height: stageRef.height(),
              scale: boundedScale,
              x,
              y
            });
          },
          duration: 0.3
        })
      }
    }
  }

  const scale = valueFromWindowWidth({
    windowW,
    w1024: 1.2/stage.scale,
    w425: 1.8/stage.scale,
    minw: 2.4/stage.scale,
  })

  return (
    <Html
      groupProps={{
        width: size.width,
        height: size.height,
        x: pos.x,
        y: pos.y,
        scale: {x: scale, y: scale}
      }}
    >
      <div className='relative' style={{scale: size.width < 1 ? size.width : 1}}>
        <Button
          ref={ref}
          className="absolute p-3 aspect-square rounded-full" 
          onClick={handleScaleTo}
        >
          {data.items.length}
        </Button>
      </div>
    </Html>
  )
}
