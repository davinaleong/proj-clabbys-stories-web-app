export function toSpotifyEmbedUrl(url) {
  if (!url) return null
  return (
    url.replace(
      "open.spotify.com/playlist",
      "open.spotify.com/embed/playlist"
    ) + "?utm_source=generator&autoplay=1"
  )
}
