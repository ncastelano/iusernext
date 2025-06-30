// components/useDataVideo.ts
import { useCallback, useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Video } from 'types/video'

export function useDataVideo() {
  const [userVideosMap, setUserVideosMap] = useState<Map<string, Video[]>>(new Map())
  const [userList, setUserList] = useState<string[]>([])

  const getSegmentColors = useCallback((videos: Video[]): string[] => {
    return videos.map(v => {
      if (v.isFlash) return 'limegreen'
      if (v.isPlace) return 'deepskyblue'
      if (v.isProduct) return 'gold'
      if (v.isStore) return 'magenta'
      return 'gray'
    })
  }, [])

  useEffect(() => {
    async function fetchData() {
      const snapshot = await getDocs(collection(db, 'videos'))
      const allVideos = snapshot.docs
        .map(doc => doc.data() as Video)
        .filter(v => v.publishedDateTime && v.videoUrl && v.userID)

      const grouped = new Map<string, Video[]>()
      for (const vid of allVideos) {
        if (!grouped.has(vid.userID)) grouped.set(vid.userID, [])
        grouped.get(vid.userID)!.push(vid)
      }

      for (const [uid, vids] of grouped.entries()) {
        grouped.set(uid, vids.sort((a, b) => b.publishedDateTime! - a.publishedDateTime!))
      }

      const sortedUsers = Array.from(grouped.entries())
        .sort(([, a], [, b]) => b[0].publishedDateTime! - a[0].publishedDateTime!)
        .map(([uid]) => uid)

      setUserVideosMap(grouped)
      setUserList(sortedUsers)
    }

    fetchData()
  }, [])

  return { userVideosMap, userList, getSegmentColors }
}
