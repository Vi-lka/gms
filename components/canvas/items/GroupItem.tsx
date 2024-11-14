"use client"

import { Button } from '@/components/ui/button'
import { stageAtom, stageRefAtom } from '@/lib/atoms/main'
import useStageEllementPos from '@/lib/hooks/useStageEllementPos'
import useWindowDimensions from '@/lib/hooks/useWindowDimensions'
import getGroupAverage from '@/lib/intersections/get-group-average'
import { IntersectionGroupT } from '@/lib/intersections/get-intersections'
import valueFromWindowWidth from '@/lib/intersections/valueFromWindowWidth'
import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { Html } from 'react-konva-utils'

export default function GroupItem({
  data,
}: {
  data: IntersectionGroupT,
}) {
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
    const scaleBy = 10;

    if (stageRef) {
      const oldScale = stageRef.scaleX();
      const mousePoint = stageRef.getPointerPosition() ?? {x: 0, y: 0};

      const newScale =  oldScale * scaleBy 

      const mousePointTo = {
        x: mousePoint.x / oldScale - stageRef.x() / oldScale,
        y: mousePoint.y / oldScale - stageRef.y() / oldScale
      };

      let boundedScale = newScale;
      if (newScale < MIN_SCALE) boundedScale = MIN_SCALE;
      if (newScale > MAX_SCALE) boundedScale = MAX_SCALE;

      const x = (mousePoint.x / boundedScale - mousePointTo.x) * boundedScale
      const y = (mousePoint.y / boundedScale - mousePointTo.y) * boundedScale

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
          className="absolute p-3 aspect-square rounded-full" 
          onClick={handleScaleTo}
        >
          {data.items.length}
        </Button>
      </div>
    </Html>
  )
}
