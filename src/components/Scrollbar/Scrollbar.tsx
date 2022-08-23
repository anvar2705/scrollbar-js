import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { normalizeValue } from './Scrollbar.utils'
import { IScrollbarProps } from './Scrollbar.types'
import s from './Scrollbar.module.scss'

const Scrollbar: FC<IScrollbarProps> = (props) => {
  const { children, ...divProps } = props
  const contentRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbClickY = useRef(0)
  const [thumbTop, setThumbTop] = useState(0)
  const [thumbHeight, setThumbHeight] = useState(0)
  const [isScrollVisible, setIsScrollVisible] = useState(true)

  useEffect(() => {
    if (contentRef.current && trackRef.current) {
      const { clientHeight: contentClientHeight, scrollHeight: contentScrollHeight } =
        contentRef.current
      const trackHeight = trackRef.current.clientHeight

      if (contentClientHeight === contentScrollHeight) {
        setIsScrollVisible(false)
      } else {
        const thumbHeightCalculated = (contentClientHeight / contentScrollHeight) * trackHeight
        setThumbHeight(normalizeValue(thumbHeightCalculated, 50, 10000))
      }
    }
  }, [])

  const onScrollContent = useCallback(() => {
    if (contentRef.current && trackRef.current) {
      const thumbTopOffset =
        (contentRef.current.scrollTop / contentRef.current.scrollHeight) *
        trackRef.current.clientHeight
      setThumbTop(thumbTopOffset)
    }
  }, [])

  const mouseMoveEventListener = useCallback(
    (event: MouseEvent) => {
      if (trackRef.current && contentRef.current) {
        const { top: trackTop, left: trackLeft } = trackRef.current.getBoundingClientRect()

        const posY = event.clientY - trackTop - thumbClickY.current
        const normalizedPosY = normalizeValue(posY, 0, trackRef.current.clientHeight - thumbHeight)

        if (Math.abs(trackLeft - event.clientX) < 160) {
          const scrollToPosY =
            (normalizedPosY / trackRef.current.clientHeight) * contentRef.current.scrollHeight

          contentRef.current.scrollTo(0, scrollToPosY)
        } else {
          contentRef.current.scrollTo(0, 0)
        }
      }
    },
    [thumbHeight]
  )

  const onMouseDownTrack = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const clickY = event.clientY - event.currentTarget.getBoundingClientRect().top
    if (contentRef.current) {
      const scrollToY =
        (clickY / event.currentTarget.clientHeight) * contentRef.current.scrollHeight -
        contentRef.current.clientHeight / 2
      contentRef.current.scrollTo(0, scrollToY)
    }
  }, [])

  const onMouseDownThumb = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation()
      document.body.style.userSelect = 'none'
      thumbClickY.current = event.clientY - event.currentTarget.getBoundingClientRect().top
      document.addEventListener('mousemove', mouseMoveEventListener)
    },
    [mouseMoveEventListener]
  )

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
    <div className={s.root} {...divProps}>
      <div
        ref={contentRef}
        onScroll={onScrollContent}
        className={s.content}
        style={{ paddingRight: isScrollVisible ? '6px' : 0 }}
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
