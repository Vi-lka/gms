import haveIntersection from "./have-intersection";

export type DataT = {
  id: string,
  name: string;
  attrs: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  }
  scale?: number;
  svg?: string
}

export type IntersectionGroupT = {
  intersection: true,
  items: DataT[]
}
export type SingleItemGroupT = {
  intersection: false,
  items: DataT
}
export type GroupT = IntersectionGroupT | SingleItemGroupT

export const PLACEHOLDER_DATA: DataT[] = [
  {
    id: "1",
    name: 'ООО "Восток-Ойл" (ГМС)',
    attrs: {
      x: -35,
      y: 40
    },
    svg: "test"
  },
  {
    id: "2",
    name: 'ООО "Таас-Юрях\nНефтегазодобыча"',
    attrs: {
      x: 200,
      y: -10
    }
  },
  {
    id: "3",
    name: 'ПАО "ХМЗ"\nг. Красноярск',
    attrs: {
      x: 15,
      y: -175
    }
  },
  {
    id: "4",
    name: 'ПАО "НЗХК"\nг. Новосибирск',
    attrs: {
      x: -75,
      y: -160,
    }
  },
]

export const DEFAULT_ITEM_SIZE = {
  width: 100,
  height: 100
}

export default function getIntersections(data: DataT[], scale: number) {
  const dataGroups: GroupT[] = []

  const intersections = data.map(item => {
    return {
      current: item,
      intersections: [] as DataT[]
    }
  })
  // Find intersections for each element
  data.forEach((first) => {
      data.forEach((second) => {
      if (first.id === second.id) return;

      const firstAttrs = {
        ...first.attrs, 
        width: DEFAULT_ITEM_SIZE.width*(1/scale), 
        height: DEFAULT_ITEM_SIZE.height*(1/scale)
      };
      const secondAttrs = {
        ...second.attrs, 
        width: DEFAULT_ITEM_SIZE.width*(1/scale), 
        height: DEFAULT_ITEM_SIZE.height*(1/scale)
      };

      if (haveIntersection(firstAttrs, secondAttrs)) {
        intersections.find((item) => item.current.id === first.id)?.intersections.push(second);
      }
    })
  })

  const intersectionItems: DataT[][] = []
  const singleItems: DataT[] = []

  const intersectionsArrs: DataT[][] = []
  intersections.forEach((item) => {    
    if (item.intersections.length > 0) {
      // Get arrays of intersections  
      const arr = [item.current, ...item.intersections].sort((a, b) => a.id.localeCompare(b.id))
      intersectionsArrs.push(arr)
    } else {
      // Get arrays of NO intersections
      singleItems.push(item.current)
    }
  })
  const set  = new Set(intersectionsArrs.map(item => JSON.stringify(item)));
  const uniqIntersections = Array.from(set).map(item => JSON.parse(item))
  intersectionItems.push(...uniqIntersections)

  // Get groups for render 
  intersectionItems.forEach(item => {
    dataGroups.push({intersection: true, items: item})
  })
  singleItems.forEach(item => {
    dataGroups.push({intersection: false, items: item})
  })

  const uniqDataGroups = dataGroups.filter((obj, index, arr) => {
    return arr.findIndex(o => {
      return JSON.stringify(o) === JSON.stringify(obj)
    }) === index
  });

  return uniqDataGroups
}