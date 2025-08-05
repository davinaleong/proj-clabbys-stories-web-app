"use client"
import { gql, useQuery } from "@apollo/client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

// ✅ Utilities
import { formatDate } from "./../../utils/format-date"

// ✅ ArchiveCard
import ArchiveCard from "./../../components/ArchiveCard"

// ✅ Icons
import plusIcon from "./../../assets/icons/plus.svg"
import iconLoaderWhite from "./../../assets/icons/loader-circle-w.svg"

// ✅ PAGINATED QUERY
const GET_PAGINATED_ARCHIVES = gql`
  query GetPaginatedArchives($after: String, $first: Int!) {
    archivesPaginated(after: $after, first: $first) {
      edges {
        cursor
        node {
          id
          title
          description
          date
          createdAt
          status
          photos {
            id
            imageUrl
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`

export default function HomePage() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  // ✅ For infinite scroll
  const [archives, setArchives] = useState([])
  const [afterCursor, setAfterCursor] = useState(null)
  const [hasNextPage, setHasNextPage] = useState(true)

  const { data, loading, fetchMore, error } = useQuery(GET_PAGINATED_ARCHIVES, {
    variables: { after: null, first: 12 },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    onCompleted: (res) => {
      const { edges, pageInfo } = res.archivesPaginated
      setArchives(edges.map((edge) => edge.node))
      setAfterCursor(pageInfo.endCursor)
      setHasNextPage(pageInfo.hasNextPage)
    },
  })

  const loaderRef = useRef(null)

  // ✅ Intersection observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]
        if (firstEntry.isIntersecting && hasNextPage) {
          loadMoreArchives()
        }
      },
      { threshold: 1.0 }
    )

    observer.observe(loaderRef.current)

    return () => observer.disconnect()
  }, [loaderRef.current, hasNextPage])

  const loadMoreArchives = async () => {
    if (!hasNextPage) return

    const res = await fetchMore({
      variables: { after: afterCursor, first: 12 },
    })

    const newEdges = res.data.archivesPaginated.edges.map((edge) => edge.node)
    setArchives((prev) => [...prev, ...newEdges])
    setAfterCursor(res.data.archivesPaginated.pageInfo.endCursor)
    setHasNextPage(res.data.archivesPaginated.pageInfo.hasNextPage)
  }

  const handleCreateClick = () => {
    setCreating(true)
    setTimeout(() => router.push("/editor/create"), 200)
  }

  if (loading && archives.length === 0) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-carbon-blue-700 text-lg">Loading archives...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error loading archives: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
      {/* ✅ Title + Add Button */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl font-bold text-carbon-blue-700">
          Archives
        </h1>
      </header>

      {/* ✅ archives Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {archives.map((archive) => {
          const previewImages =
            archive.photos?.slice(0, 4).map((p) => p.imageUrl) || []

          // ✅ Prefer gallery.date, fallback to createdAt
          const rawDate = archive.date || archive.createdAt
          let formattedDate = "No date set"
          if (rawDate) {
            const parsedDate = !isNaN(Number(rawDate))
              ? new Date(Number(rawDate))
              : new Date(rawDate)

            if (!isNaN(parsedDate)) {
              formattedDate = formatDate(
                parsedDate.toISOString(),
                "EEE_DD_MMM_YYYY"
              )
            }
          }

          return (
            <ArchiveCard
              key={archive.id}
              images={previewImages}
              title={archive.title}
              status={archive.status}
              date={formattedDate}
              description={archive.description || "No description provided."}
              href={`/editor/archives/${archive.id}`}
            />
          )
        })}
      </section>

      {/* ✅ Infinite Scroll Loader */}
      {hasNextPage && (
        <div ref={loaderRef} className="flex justify-center py-6">
          <Image
            src={iconLoaderWhite}
            alt="Loading more..."
            width={24}
            height={24}
            className="animate-spin"
          />
        </div>
      )}
    </main>
  )
}
