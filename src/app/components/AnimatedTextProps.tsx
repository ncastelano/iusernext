import React, { useEffect, useState } from 'react'

interface AnimatedTextProps {
  text: string
  isLoading: boolean
  isNumberAnimation?: boolean
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, isLoading, isNumberAnimation = false }) => {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    const chars = isNumberAnimation
      ? '0123456789.'
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    if (!isLoading) {
      setDisplayText(text)
      return
    }

    let frame = 0
    const interval = setInterval(() => {
      let newText = ''
      for (let i = 0; i < text.length; i++) {
        if (Math.random() < 0.3) {
          newText += chars.charAt(Math.floor(Math.random() * chars.length))
        } else {
          newText += text.charAt(i)
        }
      }
      setDisplayText(newText)
      frame++
      if (frame > 20) {
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [text, isLoading, isNumberAnimation])

  return <span>{displayText}</span>
}

export default AnimatedText
