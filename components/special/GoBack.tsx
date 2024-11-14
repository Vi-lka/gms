"use client"

import React from 'react'
import { Button, ButtonProps } from '../ui/button'
import { useRouter } from 'next/navigation'

const GoBack = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => {

      const router = useRouter();

      return (
        <Button 
            ref={ref} 
            {...props}
            onClick={() => router.back()}
        />
      )
    }
  )
  GoBack.displayName = "GoBack"
  
export default GoBack
