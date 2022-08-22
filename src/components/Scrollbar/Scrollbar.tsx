import React, { FC, useEffect, useRef, useState, useCallback } from 'react'
import { normalizeValue } from './Scrollbar.utils'
import { IScrollbarProps } from './Scrollbar.types'
import s from './Scrollbar.module.scss'

const Scrollbar: FC<IScrollbarProps> = ({ children, ...divProps }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumbTop, setThumbTop] = useState(0)
  const [thumbHeight, setThumbHeight] = useState(0)
  const [isScrollVisible, setIsScrollVisible] = useState(true)

  // set thumb height
  useEffect(() => {
    const contentClientHeight = contentRef.current?.clientHeight
    const contentScrollHeight = contentRef.current?.scrollHeight
    const trackHeight = trackRef.current?.clientHeight

    if (contentClientHeight === contentScrollHeight) {
      setIsScrollVisible(false)
    } else if (contentClientHeight && contentScrollHeight && trackHeight) {
      const thumbHeightCalculated = (contentClientHeight / contentScrollHeight) * trackHeight
      setThumbHeight(thumbHeightCalculated)
    }
  }, [contentRef, trackRef])

  // mouseMove event listener
  const mouseMoveEventListener = useCallback(
    (event: MouseEvent) => {
      if (trackRef.current && contentRef.current) {
        const posY =
          event.clientY - (trackRef.current.getBoundingClientRect().top + thumbHeight / 2)
        const normalizedPosY = normalizeValue(posY, 0, trackRef.current.clientHeight - thumbHeight)

        const scrollToPosY =
          ((normalizedPosY + thumbHeight / 2) / trackRef.current.clientHeight) *
            contentRef.current.scrollHeight -
          contentRef.current.clientHeight / 2

        contentRef.current.scrollTo(0, scrollToPosY)
      }
    },
    [trackRef, thumbHeight]
  )

  // move scroll thumb by onScroll event
  const onScrollContent = () => {
    if (contentRef.current && trackRef.current) {
      const thumbTopOffset =
        (contentRef.current.scrollTop / contentRef.current.scrollHeight) *
        trackRef.current.clientHeight
      setThumbTop(thumbTopOffset)
    }
  }

  // mouseDown track event - scroll content if click to track
  const onMouseDownTrack = (event: React.MouseEvent<HTMLDivElement>) => {
    const clickY = event.clientY - event.currentTarget.getBoundingClientRect().top
    if (contentRef.current) {
      const scrollToY =
        (clickY / event.currentTarget.offsetHeight) * contentRef.current.scrollHeight -
        contentRef.current.clientHeight / 2
      contentRef.current.scrollTo(0, scrollToY)
    }
  }

  // mouseDown thumb event
  const onMouseDownThumb = (event: React.MouseEvent<HTMLDivElement>) => {
    // stop propagation to track & disable selection for body
    event.stopPropagation()
    document.body.style.userSelect = 'none'

    // get y coordinate relative to thumb
    const clientY = event.clientY - event.currentTarget.getBoundingClientRect().top

    // move center of scroll thumb to mouse
    if (trackRef.current && contentRef.current) {
      // get top border width for scroll track
      const trackBorderTopWidth = getComputedStyle(trackRef.current).borderTopWidth
      const trackBorderTopWidthValue = Number(
        trackBorderTopWidth.slice(0, trackBorderTopWidth.indexOf('px'))
      )

      // current position of thumb relative to top of track without border
      const currentPosY =
        event.currentTarget.getBoundingClientRect().top -
        (trackRef.current.getBoundingClientRect().top + trackBorderTopWidthValue)

      // calculate new position of thumb
      const posY = normalizeValue(
        currentPosY + clientY - thumbHeight / 2,
        0,
        contentRef.current.clientHeight - thumbHeight
      )

      // scroll to new thumb position
      const scrollToPosY =
        ((posY + thumbHeight / 2) / trackRef.current.clientHeight) *
          contentRef.current.scrollHeight -
        contentRef.current.clientHeight / 2
      contentRef.current.scrollTo(0, scrollToPosY)
    }

    document.addEventListener('mousemove', mouseMoveEventListener)
  }

  // add mouseUp event listener to remove mouseMove event listener for thumb
  const mouseUpEventListener = useCallback(() => {
    document.removeEventListener('mousemove', mouseMoveEventListener)
    document.body.style.userSelect = 'auto'
  }, [mouseMoveEventListener])

  useEffect(() => {
    document.addEventListener('mouseup', mouseUpEventListener)

    return () => {
      document.removeEventListener('mouseup', mouseUpEventListener)
    }
  }, [mouseUpEventListener])

  return (
    <div {...divProps} className={s.root}>
      <div
        ref={contentRef}
        onScroll={onScrollContent}
        className={s.content}
        style={{ paddingRight: isScrollVisible ? '8px' : 0 }}
      >
        {children}
      </div>
      <div
        className={s.track}
        ref={trackRef}
        onMouseDown={onMouseDownTrack}
        style={{ display: isScrollVisible ? 'block' : 'none' }}
      >
        <div
          className={s.thumb}
          onMouseDown={onMouseDownThumb}
          style={{ height: `${thumbHeight}px`, top: `${thumbTop}px` }}
        />
      </div>
    </div>
  )
}

export default Scrollbar
