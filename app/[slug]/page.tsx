import MapTable from '@/components/canvas/items/MapTable'
import GoBack from '@/components/special/GoBack'
import { TypographyH4 } from '@/components/typography'
import { PLACEHOLDER_DATA } from '@/lib/intersections/get-intersections'
import { ArrowLeftFromLine } from 'lucide-react'
import React from 'react'

export default async function SecondLevel({ 
  params 
}: { 
  params: { slug: string }
}) {

  const data = PLACEHOLDER_DATA.find(item => item.id === params.slug)

  if (!data || !data.svg) return <div>Not found</div>

  return (
    <div className='w-screen h-screen flex flex-col justify-center relative'>
      <GoBack className='absolute top-1 left-1 z-10'>
        Назад <ArrowLeftFromLine />
      </GoBack>
      <TypographyH4 className='absolute text-center top-3 left-1/2 -translate-x-1/2 bg-accent rounded-full p-3 z-10'>{data.name}</TypographyH4>
      <MapTable svg={data.svg} className='' />
    </div>
  )
}
