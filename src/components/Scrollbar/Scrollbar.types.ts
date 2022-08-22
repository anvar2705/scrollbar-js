import React from 'react'
import CSS from 'csstype'

export interface IScrollbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: Omit<CSS.Properties, 'position' | 'height'>
}
