import { DataT, DEFAULT_ITEM_SIZE } from "./get-intersections";

function calculateAverage(arr: number[]): number {
  if (arr.length === 0) return 0;

  const sum = arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  return sum / arr.length;
}

export default function getGroupAverage(items: DataT[]) {
  const xValues = items.map(itm => itm.attrs.x + DEFAULT_ITEM_SIZE.width/(items.length+2))
  const yValues = items.map(itm => itm.attrs.y + DEFAULT_ITEM_SIZE.height/(items.length+2))
  const widthValues = items.map(itm => itm.attrs.width).filter((itm): itm is number => !!itm)
  const heightValues = items.map(itm => itm.attrs.height).filter((itm): itm is number => !!itm)

  return {
    x: calculateAverage(xValues),
    y: calculateAverage(yValues),
    width: calculateAverage(widthValues),
    height: calculateAverage(heightValues),
  }
}
