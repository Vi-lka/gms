"use client"

import { GroupT } from '@/lib/intersections/get-intersections'
import React from 'react'
import GroupItem from './items/GroupItem'
import SingleItem from './items/SingleItem'

export default function MapItem({
  data
}: {
  data: GroupT,
})  {
  if (data.intersection) return <GroupItem data={data} />
  return <SingleItem data={data.items} />
}
