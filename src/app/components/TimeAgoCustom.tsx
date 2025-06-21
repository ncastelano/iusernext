import React, { useEffect, useState } from 'react'

type TimeAgoCustomProps = {
  timestamp?: number | null
}

const loadingChars = ['|', '/', '-', '\\']

export default function TimeAgoCustom({ timestamp }: TimeAgoCustomProps) {
  const [loadingCharIndex, setLoadingCharIndex] = useState(0)
  const [timeAgoText, setTimeAgoText] = useState('')

  useEffect(() => {
    if (!timestamp) {
      // Loop para trocar caracteres de loading
      const interval = setInterval(() => {
        setLoadingCharIndex(prev => (prev + 1) % loadingChars.length)
      }, 150) // troca a cada 150ms

      return () => clearInterval(interval)
    } else {
      // Se timestamp existe, para o loading e calcula o texto
      function timeAgo(ts: number) {
        const now = Date.now()
        const secondsPast = Math.floor((now - ts) / 1000)

        if (secondsPast < 60) return `há ${secondsPast} segundo${secondsPast !== 1 ? 's' : ''}`
        if (secondsPast < 3600) return `há ${Math.floor(secondsPast / 60)} minuto${secondsPast < 120 ? '' : 's'}`
        if (secondsPast < 86400) return `há ${Math.floor(secondsPast / 3600)} hora${secondsPast < 7200 ? '' : 's'}`
        if (secondsPast < 2592000) return `há ${Math.floor(secondsPast / 86400)} dia${secondsPast < 172800 ? '' : 's'}`
        if (secondsPast < 31104000) return `há ${Math.floor(secondsPast / 2592000)} mês${secondsPast < 5184000 ? '' : 'es'}`
        return `há ${Math.floor(secondsPast / 31104000)} ano${secondsPast < 62208000 ? '' : 's'}`
      }

      setTimeAgoText(timeAgo(timestamp))
    }
  }, [timestamp])

  if (!timestamp) {
    return <span>carregando {loadingChars[loadingCharIndex]}</span>
  }

  return <span>{timeAgoText}</span>
}
