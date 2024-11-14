"use client"

import useWindowDimensions from '@/lib/hooks/useWindowDimensions';
import { cn } from '@/lib/utils';
import { 
  KonvaEventObject, 
  NodeConfig as KonvaNodeConfig, 
  Node as KonvaNode 
} from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { Stage as StageT } from 'konva/lib/Stage';
import React, { useEffect, useMemo, useRef } from 'react'
import { Stage, Layer } from 'react-konva';
import MapImage from './MapImage';
import MapItem from './MapItem';
import getIntersections, { PLACEHOLDER_DATA } from '@/lib/intersections/get-intersections';
import valueFromWindowWidth from '@/lib/intersections/valueFromWindowWidth';
import { useAtom, useSetAtom } from "jotai"
import { stageAtom, stageRefAtom } from '@/lib/atoms/main';
import Konva from 'konva';

export default function MainStage({
  className,
}: {
  className?: string,
}) {
  Konva.hitOnDragEnabled = true

  const ref = useRef<StageT>(null);

  const setStageRef = useSetAtom(stageRefAtom)

  useEffect(() => {
    if (ref.current) setStageRef(ref.current)
  }, [ref, setStageRef])

  const { width, height } = useWindowDimensions();

  const [stage, setStage] = useAtom(stageAtom);

  useEffect(() => {
    setStage(prev => ({
      ...prev,
      width, 
      height, 
    }))
  }, [width, height, setStage])

  const MIN_SCALE = valueFromWindowWidth({
    windowW: width,
    w1024: 0.9,
    w425: 0.9,
    minw: 1,
  })
  const MAX_SCALE = valueFromWindowWidth({
    windowW: width,
    w1024: 4,
    w425: 15,
    minw: 20,
  })

  const scaleForIntersections = valueFromWindowWidth({
    windowW: width,
    w1024: stage.scale,
    w425: 0.4*stage.scale,
    minw: 0.3*stage.scale,
  })

  const intersections = useMemo(
    () => getIntersections(PLACEHOLDER_DATA, scaleForIntersections),
    [scaleForIntersections]
  );

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = width > 1024 ? 1.6 : 1.4;
    
    const eventStage = e.target.getStage();
    if (eventStage) {
      const oldScale = eventStage.scaleX();
      const mousePoint = eventStage.getPointerPosition() ?? {x: 0, y: 0};
      const mousePointTo = {
        x: mousePoint.x / oldScale - eventStage.x() / oldScale,
        y: mousePoint.y / oldScale - eventStage.y() / oldScale
      };

      const newScale = e.evt.deltaY < 0 
        ? oldScale * scaleBy 
        : oldScale / scaleBy;

      let boundedScale = newScale;
      if (newScale < MIN_SCALE) boundedScale = MIN_SCALE;
      if (newScale > MAX_SCALE) boundedScale = MAX_SCALE;

      const x = boundedScale >= MIN_SCALE 
        ? (mousePoint.x / boundedScale - mousePointTo.x) * boundedScale 
        : (width*(1-MIN_SCALE))/2;

      const y = boundedScale >= MIN_SCALE 
        ? (mousePoint.y / boundedScale - mousePointTo.y) * boundedScale 
        : (height*(1-MIN_SCALE))/2

      const childrenScale = valueFromWindowWidth({
        windowW: width,
        w1024: 1.2/boundedScale,
        w425: 1.8/boundedScale,
        minw: 2.4/boundedScale,
      })

      eventStage.children.forEach(lr => {
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

      eventStage.to({
        width: eventStage.width(),
        height: eventStage.height(),
        scaleX: boundedScale,
        scaleY: boundedScale,
        x,
        y,
        onFinish: () => {
          setStage({
            width: eventStage.width(),
            height: eventStage.height(),
            scale: boundedScale,
            x,
            y
          });
        },
        duration: 0.3
      })
    }
  };

  function handleDragBound(this: KonvaNode<KonvaNodeConfig>, pos: Vector2d): Vector2d {
    const leftBound = (-stage.width * (MIN_SCALE - stage.scale))/(stage.scale*2)
    const rightBound = Math.max(pos.x, stage.width * (MIN_SCALE - stage.scale))

    const topBound = (-stage.height * (MIN_SCALE - stage.scale))/(stage.scale*2)
    const bottomBound = Math.max(pos.y, stage.height * (MIN_SCALE - stage.scale))

    const x = Math.min(leftBound, rightBound);
    const y = Math.min(topBound, bottomBound);

    if (stage.scale <= MIN_SCALE) return ({ 
      x: (stage.width*(1-MIN_SCALE))/2, 
      y: (stage.height*(1-MIN_SCALE))/2
    })
    else return { x, y };
  }

  function getDistance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  function getCenter(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  let lastCenter: { x: number, y: number } | null = null;
  let lastDist = 0;
  let dragStopped = false;

  const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault();

    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    const eventStage = e.target.getStage();

    if (eventStage) {
      // we need to restore dragging, if it was cancelled by multi-touch
      if (touch1 && !touch2 && !eventStage.isDragging() && dragStopped) {
        eventStage.startDrag();
        dragStopped = false;
      }

      if (touch1 && touch2) {
        // if the stage was under Konva's drag&drop
        // we need to stop it, and implement our own pan logic with two pointers
        if (eventStage.isDragging()) {
          dragStopped = true;
          eventStage.stopDrag();
        }
  
        const p1 = {
          x: touch1.clientX,
          y: touch1.clientY,
        };
        const p2 = {
          x: touch2.clientX,
          y: touch2.clientY,
        };
  
        if (!lastCenter) {
          lastCenter = getCenter(p1, p2);
          return;
        }
        const newCenter = getCenter(p1, p2);
  
        const dist = getDistance(p1, p2);
  
        if (!lastDist) {
          lastDist = dist;
        }
  
        // local coordinates of center point
        const pointTo = {
          x: (newCenter.x - eventStage.x()) / eventStage.scaleX(),
          y: (newCenter.y - eventStage.y()) / eventStage.scaleX(),
        };
  
        const newScale = eventStage.scaleX() * (dist / lastDist);

        let boundedScale = newScale;
        if (newScale < MIN_SCALE) boundedScale = MIN_SCALE;
        if (newScale > MAX_SCALE) boundedScale = MAX_SCALE;
  
        // calculate new position of the stage
        const dx = newCenter.x - lastCenter.x;
        const dy = newCenter.y - lastCenter.y;

        const newPos = {
          x: newCenter.x - pointTo.x * boundedScale + dx,
          y: newCenter.y - pointTo.y * boundedScale + dy
        }

        const childrenScale = valueFromWindowWidth({
          windowW: width,
          w1024: 1.2/boundedScale,
          w425: 1.8/boundedScale,
          minw: 2.4/boundedScale,
        })
  
        eventStage.children.forEach(lr => {
          if (lr.attrs.id !== "main-image") {
            lr.children.forEach(grp => {
              grp.scaleX(childrenScale)
              grp.scaleY(childrenScale)
            })
          }
        })

        eventStage.scaleX(boundedScale)
        eventStage.scaleY(boundedScale)
        eventStage.position(newPos)

        lastDist = dist;
        lastCenter = newCenter;
      }
    }
  }

  const handleTouchEnd = (e: KonvaEventObject<TouchEvent>) => {
    lastDist = 0;
    lastCenter = null;

    const eventStage = e.target.getStage();

    if (eventStage) {
      setStage({
        width: eventStage.width(),
        height: eventStage.height(),
        scale: eventStage.scaleX(),
        x: eventStage.x(),
        y: eventStage.y(),
      });
    }
  }

  return (
      <Stage 
        ref={ref}
        width={width}
        height={height}
        draggable
        dragBoundFunc={handleDragBound}
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn("overflow-hidden relative", className)}
      >
        <Layer id='main-image'>
          <MapImage />
        </Layer>
        <Layer>
          {intersections.map((item, indx) => (
            <MapItem key={indx} data={item} />
          ))}
        </Layer>
      </Stage>
  )
}