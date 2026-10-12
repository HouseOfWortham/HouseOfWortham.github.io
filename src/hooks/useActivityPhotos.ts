import { useEffect, useState } from 'react'
import { loadActivityPhotos, type GoogleDrivePhoto } from '@/lib/googleDrivePhotos'

export function useActivityPhotos(folderId: string) {
  const [photos, setPhotos] = useState<GoogleDrivePhoto[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!folderId.trim()) {
      setPhotos([])
      setError(null)
      return
    }

    const controller = new AbortController()
    void loadActivityPhotos(folderId.trim(), controller.signal)
      .then((loadedPhotos) => {
        setPhotos(loadedPhotos)
        setError(null)
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load activity photos.')
        }
      })

    return () => controller.abort()
  }, [folderId])

  return { photos, error }
}
