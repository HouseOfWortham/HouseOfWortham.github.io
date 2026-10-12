export type GoogleDrivePhoto = {
  id: string
  name: string
  imageUrl: string
  viewUrl: string
  album: 'current' | 'past' | 'activity'
}

type DriveFile = {
  id?: string
  name?: string
  mimeType?: string
  webViewLink?: string
}

type DriveListResponse = {
  files?: DriveFile[]
  nextPageToken?: string
  error?: { message?: string }
}

const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY?.trim()
const priorFolderId = import.meta.env.VITE_GOOGLE_DRIVE_PRIOR_TRIPS_FOLDER_ID?.trim()
const currentFolderId = import.meta.env.VITE_GOOGLE_DRIVE_CURRENT_TRIP_FOLDER_ID?.trim()

async function listFolderPhotos(
  folderId: string,
  key: string,
  album: GoogleDrivePhoto['album'],
  signal: AbortSignal,
): Promise<GoogleDrivePhoto[]> {
  const photos: GoogleDrivePhoto[] = []
  let pageToken: string | undefined

  do {
    const url = new URL('https://www.googleapis.com/drive/v3/files')
    url.searchParams.set('q', `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`)
    url.searchParams.set('key', key)
    url.searchParams.set(
      'fields',
      'nextPageToken,files(id,name,mimeType,webViewLink)',
    )
    url.searchParams.set('pageSize', '100')
    url.searchParams.set('orderBy', 'modifiedTime desc')
    url.searchParams.set('includeItemsFromAllDrives', 'true')
    url.searchParams.set('supportsAllDrives', 'true')
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const response = await fetch(url, { signal })
    const result = (await response.json()) as DriveListResponse
    if (!response.ok) {
      throw new Error(result.error?.message ?? `Google Drive returned ${response.status}.`)
    }

    for (const file of result.files ?? []) {
      if (!file.id || !file.name || !file.mimeType?.startsWith('image/')) continue
      photos.push({
        id: file.id,
        name: file.name,
        imageUrl: `https://lh3.googleusercontent.com/d/${encodeURIComponent(file.id)}=s1600`,
        viewUrl: file.webViewLink ?? `https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`,
        album,
      })
    }
    pageToken = result.nextPageToken
  } while (pageToken)

  return photos
}

export async function loadGoogleDrivePhotos(signal: AbortSignal) {
  if (!apiKey || !priorFolderId || !currentFolderId) {
    throw new Error(
      'The photo gallery needs a Drive API key and both folder IDs. Add the VITE_GOOGLE_DRIVE settings to the site configuration.',
    )
  }

  const [currentPhotos, priorPhotos] = await Promise.all([
    listFolderPhotos(currentFolderId, apiKey, 'current', signal),
    listFolderPhotos(priorFolderId, apiKey, 'past', signal),
  ])

  return [...currentPhotos, ...priorPhotos]
}

export async function loadActivityPhotos(folderId: string, signal: AbortSignal) {
  if (!apiKey) {
    throw new Error('The activity photo carousel needs VITE_GOOGLE_DRIVE_API_KEY configured.')
  }
  return listFolderPhotos(folderId, apiKey, 'activity', signal)
}

export function getCurrentTripFolderUrl() {
  return currentFolderId
    ? `https://drive.google.com/drive/folders/${encodeURIComponent(currentFolderId)}`
    : null
}
