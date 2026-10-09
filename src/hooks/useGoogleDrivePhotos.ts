import { useEffect, useState } from 'react'
import { loadGoogleDrivePhotos, type GoogleDrivePhoto } from '@/lib/googleDrivePhotos'

export function useGoogleDrivePhotos() {
  const [photos, setPhotos] = useState<GoogleDrivePhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    void loadGoogleDrivePhotos(controller.signal)
      .then(setPhotos)
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load the Google Drive photos.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  return { photos, loading, error }
}
