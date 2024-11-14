"use client"

import useStageEllementPos from '@/lib/hooks/useStageEllementPos'
import React from 'react'
import { Html } from 'react-konva-utils'
import { Button } from '../../ui/button'
import useWindowDimensions from '@/lib/hooks/useWindowDimensions'
import { DataT } from '@/lib/intersections/get-intersections'
import valueFromWindowWidth from '@/lib/intersections/valueFromWindowWidth'
import { useAtomValue } from 'jotai'
import { stageAtom } from '@/lib/atoms/main'
import { CircleDot } from 'lucide-react'
import Link from 'next/link'

export default function SingleItem({
  data,
}: {
  data: DataT,
}) {
  const stage = useAtomValue(stageAtom)

  const { width: windowW } = useWindowDimensions();

  const { width, height, x, y } = data.attrs

  const {size, pos} = useStageEllementPos(
    {width, height},
    {x, y}
  )

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
      <Link href={`/${data.id}`}>
        <Button className="absolute block p-0.5 w-fit h-fit aspect-square text-center rounded-full group hover:bg-accent duration-300">
          <CircleDot className='mx-auto !w-5 !h-5 group-hover:text-foreground'/>
          <p className='relative font-semibold text-xs'>
            <span className='absolute whitespace-pre top-[-17px] left-7 text-foreground bg-accent group-hover:underline rounded-md'>{data.name}</span>
          </p>
        </Button>
      </Link>
      </div>
    </Html>
  )
}
