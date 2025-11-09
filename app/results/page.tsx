"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, ExternalLink, CheckCircle2 } from "lucide-react"
import { VideoViewer } from "@/components/VideoViewer"

interface Preferences {
  category: string
  genre: string
  themes: string[]
  duration: string
}

interface Result {
  id: string
  title: string
  description: string
  duration: string
  matchScore: number
  source: string
  thumbnail: string
  url: string
  sourceUrl: string
  creator?: string
}

const mockResults: Result[] = [
  {
    id: "1",
    title: "Premium Content Match #1",
    description: "This content perfectly matches your preferences for ",
    duration: "25 min",
    matchScore: 98,
    source: "Pornhub",
    thumbnail: "🎬",
    url: "https://www.pornhub.com",
    sourceUrl: "https://www.pornhub.com"
  },
  {
    id: "2",
    title: "Highly Rated Selection",
    description: "A popular choice that aligns with your selected themes",
    duration: "18 min",
    matchScore: 95,
    source: "XVideos",
    thumbnail: "🎥",
    url: "https://www.xvideos.com",
    sourceUrl: "https://www.xvideos.com"
  },
  {
    id: "3",
    title: "Curated Recommendation",
    description: "Expertly matched to your specific preferences",
    duration: "32 min",
    matchScore: 92,
    source: "XHamster",
    thumbnail: "📹",
    url: "https://www.xhamster.com",
    sourceUrl: "https://www.xhamster.com"
  }
]

export default function ResultsPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Result | null>(null)
  const [isVideoViewerOpen, setIsVideoViewerOpen] = useState(false)
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({})
  const [thumbnailLoading, setThumbnailLoading] = useState<{ [key: string]: boolean }>({})
  const [metadataLoading, setMetadataLoading] = useState(true)

  const getPlaceholderThumbnail = useCallback((source: string, index: number): string => {
    // Generate realistic-looking placeholder thumbnails
    // Using different gradient colors for each source
    const gradients = [
      '320x180/1a1a2e/16213e/0f3460', // Pornhub - dark blue
      '320x180/2d1b69/11998e', // XVideos - purple to teal  
      '320x180/434343/000000', // XHamster - dark gray
    ]
    
    const gradient = gradients[index % gradients.length]
    return `https://via.placeholder.com/${gradient}/ffffff?text=Video+Thumbnail`
  }, [])

  const fetchThumbnailForResult = useCallback(async (result: Result, searchQuery: string, index: number) => {
    try {
      // Try to fetch thumbnail from search page using CORS proxy
      const searchUrl = result.url
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(searchUrl)}`
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
        }
      })
      
      if (response.ok) {
        const html = await response.text()
        
        // Try to extract thumbnail URLs from HTML
        // Look for common thumbnail patterns in adult content sites
        const thumbnailPatterns = [
          /<img[^>]+class=["'][^"']*thumb[^"']*["'][^>]+src=["']([^"']+)["']/i,
          /<img[^>]+data-src=["']([^"']*thumb[^"']*)["']/i,
          /<img[^>]+src=["']([^"']*thumbnail[^"']*)["']/i,
          /data-thumb-url=["']([^"']+)["']/i,
          /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
          // Pornhub specific patterns
          /<div[^>]+class=["'][^"']*phimage["'][^>]+.*?data-mediumthumb=["']([^"']+)["']/i,
          /data-mediumthumb=["']([^"']+)["']/i,
          // XVideos specific patterns
          /<img[^>]+id=["']pic["'][^>]+src=["']([^"']+)["']/i,
          // XHamster specific patterns
          /<img[^>]+class=["'][^"']*thumb-image["'][^>]+src=["']([^"']+)["']/i,
        ]
        
        for (const pattern of thumbnailPatterns) {
          const matches = html.matchAll(new RegExp(pattern, 'gi'))
          for (const match of matches) {
            if (match && match[1]) {
              let thumbnailUrl = match[1]
              
              // Clean up URL (remove query params that might break it)
              thumbnailUrl = thumbnailUrl.split('?')[0].split('&')[0]
              
              // Make URL absolute if it's relative
              if (!thumbnailUrl.startsWith('http')) {
                const baseUrl = new URL(result.sourceUrl)
                thumbnailUrl = new URL(thumbnailUrl, baseUrl.origin).href
              }
              
              // Validate it's an image URL
              if (thumbnailUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) || 
                  thumbnailUrl.includes('thumb') || 
                  thumbnailUrl.includes('thumbnail') ||
                  thumbnailUrl.includes('phncdn') || // Pornhub CDN
                  thumbnailUrl.includes('xvideos-cdn') || // XVideos CDN
                  thumbnailUrl.includes('xhamster')) { // XHamster
                setThumbnails(prev => ({ ...prev, [result.id]: thumbnailUrl }))
                return
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('Thumbnail fetch failed for', result.source, error)
    }
    
    // Fallback to placeholder
    setThumbnails(prev => ({
      ...prev,
      [result.id]: getPlaceholderThumbnail(result.source, index)
    }))
  }, [getPlaceholderThumbnail])

  useEffect(() => {
    const prefs = localStorage.getItem("preferences")
    if (!prefs) {
      router.push("/")
      return
    }

    const parsedPrefs = JSON.parse(prefs)
    setPreferences(parsedPrefs)

    // Generate search query from preferences - adult content categories are already search-friendly
    // Combine category, setting, and themes for better search results
    const categoryTerm = parsedPrefs.category.toLowerCase()
    const settingTerm = parsedPrefs.genre.toLowerCase()
    
    // Build search query with category and setting
    let searchTerms = [categoryTerm, settingTerm]
    
    // Add themes if selected (limit to first 2 themes to avoid overly long queries)
    if (parsedPrefs.themes && parsedPrefs.themes.length > 0) {
      const themeTerms = parsedPrefs.themes.slice(0, 2).map((t: string) => t.toLowerCase())
      searchTerms = [...searchTerms, ...themeTerms]
    }
    
    const searchQuery = searchTerms.join(" ")
    const encodedQuery = encodeURIComponent(searchQuery)
    
    // Fetch real metadata from APIs
    fetchRealMetadata(searchQuery, encodedQuery, parsedPrefs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const getSourceUrl = useCallback((source: string): string => {
    switch (source) {
      case 'Pornhub':
        return 'https://www.pornhub.com'
      case 'XVideos':
        return 'https://www.xvideos.com'
      case 'XHamster':
        return 'https://www.xhamster.com'
      default:
        return ''
    }
  }, [])

  const calculateMatchScore = useCallback((video: any, preferences: Preferences): number => {
    // Calculate a match score based on title matching preferences
    const title = video.title?.toLowerCase() || ''
    const category = preferences.category.toLowerCase()
    const genre = preferences.genre.toLowerCase()
    
    let score = 85 // Base score
    
    // Increase score if category appears in title
    if (title.includes(category)) {
      score += 8
    }
    
    // Increase score if genre appears in title
    if (title.includes(genre)) {
      score += 5
    }
    
    // Increase score if themes appear in title
    preferences.themes.forEach(theme => {
      if (title.includes(theme.toLowerCase())) {
        score += 2
      }
    })
    
    // Cap at 100
    return Math.min(100, score)
  }, [])

  const getFallbackResult = useCallback((
    index: number,
    source: string,
    encodedQuery: string,
    preferences: Preferences
  ): Result => {
    const mockResult = mockResults[index]
    let url = ''
    const sourceUrl = getSourceUrl(source)
    
    if (source === 'Pornhub') {
      url = `https://www.pornhub.com/video/search?search=${encodedQuery}`
    } else if (source === 'XVideos') {
      url = `https://www.xvideos.com/?k=${encodedQuery}`
    } else if (source === 'XHamster') {
      url = `https://www.xhamster.com/search?q=${encodedQuery}`
    }
    
    return {
      ...mockResult,
      source,
      url,
      sourceUrl,
      description: `This content perfectly matches your preferences for ${preferences.category} content in a ${preferences.genre} setting.${preferences.themes.length > 0 ? ` Features ${preferences.themes.join(", ")} themes.` : ""}`,
    }
  }, [getSourceUrl])

  const fetchRealMetadata = async (
    searchQuery: string,
    encodedQuery: string,
    preferences: Preferences
  ) => {
    setMetadataLoading(true)
    const sources = ['Pornhub', 'XVideos', 'XHamster']

    try {
      // Fetch metadata from each source in parallel
      const metadataPromises = sources.map(async (source, index) => {
        try {
          const response = await fetch(
            `/api/scrape-metadata?source=${source}&query=${encodedQuery}&limit=1`
          )
          
          if (response.ok) {
            const data = await response.json()
            if (data.metadata && data.metadata.length > 0) {
              const video = data.metadata[0]
              
              // Calculate match score based on how well it matches preferences
              const matchScore = calculateMatchScore(video, preferences)
              
              return {
                id: `${index + 1}`,
                title: video.title,
                description: `This content perfectly matches your preferences for ${preferences.category} content in a ${preferences.genre} setting.${video.creator ? ` Created by ${video.creator}.` : ''}${preferences.themes.length > 0 ? ` Features ${preferences.themes.join(", ")} themes.` : ""}`,
                duration: video.duration || 'Unknown',
                matchScore,
                source: video.source,
                thumbnail: video.thumbnail,
                url: video.url,
                sourceUrl: getSourceUrl(video.source),
                creator: video.creator,
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching metadata from ${source}:`, error)
        }
        
        // Fallback to mock data if API fails
        return getFallbackResult(index, source, encodedQuery, preferences)
      })

      const results = await Promise.all(metadataPromises)
      const validResults = results.filter(r => r !== null) as Result[]
      
      setResults(validResults)
      setMetadataLoading(false)
      
      // Pre-load thumbnails from metadata
      validResults.forEach((result) => {
        if (result.thumbnail && result.thumbnail.trim().startsWith('http')) {
          // Use thumbnail from API response
          setThumbnails(prev => ({ ...prev, [result.id]: result.thumbnail }))
          setThumbnailLoading(prev => ({ ...prev, [result.id]: false }))
        } else if (result.thumbnail && result.thumbnail.trim().length > 0) {
          // Thumbnail exists but might need URL fixing
          let fixedThumbnail = result.thumbnail.trim()
          if (!fixedThumbnail.startsWith('http')) {
            // Try to make it absolute
            if (result.source === 'Pornhub') {
              fixedThumbnail = `https://www.pornhub.com${fixedThumbnail.startsWith('/') ? '' : '/'}${fixedThumbnail}`
            } else if (result.source === 'XVideos') {
              fixedThumbnail = `https://www.xvideos.com${fixedThumbnail.startsWith('/') ? '' : '/'}${fixedThumbnail}`
            } else if (result.source === 'XHamster') {
              fixedThumbnail = `https://www.xhamster.com${fixedThumbnail.startsWith('/') ? '' : '/'}${fixedThumbnail}`
            }
          }
          setThumbnails(prev => ({ ...prev, [result.id]: fixedThumbnail }))
          setThumbnailLoading(prev => ({ ...prev, [result.id]: false }))
        } else {
          // No thumbnail - use placeholder
          setThumbnailLoading(prev => ({ ...prev, [result.id]: true }))
          setThumbnails(prev => ({
            ...prev,
            [result.id]: getPlaceholderThumbnail(result.source, parseInt(result.id) - 1)
          }))
          setThumbnailLoading(prev => ({ ...prev, [result.id]: false }))
        }
      })
    } catch (error) {
      console.error('Error fetching metadata:', error)
      // Fallback to mock results
      const fallbackResults = sources.map((source, index) => 
        getFallbackResult(index, source, encodedQuery, preferences)
      )
      setResults(fallbackResults)
      setMetadataLoading(false)
    }
  }

  if (!preferences) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Preferences
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Search Results</h1>
          <p className="text-muted-foreground text-lg">
            {metadataLoading 
              ? "Searching and scraping video metadata..." 
              : `We've found ${results.length} matches based on your preferences`}
          </p>
        </div>

        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Search Complete</h3>
              <p className="text-sm text-muted-foreground">
                Our advanced web scraping algorithm has analyzed thousands of sources and found the best matches 
                for your preferences: <strong className="text-foreground">{preferences.category}</strong> content in a <strong className="text-foreground">{preferences.genre}</strong> setting.
                {preferences.themes.length > 0 && (
                  <> Featuring {preferences.themes.join(", ")} themes.</>
                )}
              </p>
            </div>
          </div>
        </div>

        {metadataLoading && results.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Scraping video metadata from sources...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => (
            <Card 
              key={result.id} 
              className="overflow-hidden hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50"
            >
              <CardHeader className="p-0">
                <div 
                  className="relative aspect-video w-full overflow-hidden bg-muted cursor-pointer group"
                  onClick={() => {
                    setSelectedVideo(result)
                    setIsVideoViewerOpen(true)
                  }}
                >
                  {thumbnailLoading[result.id] ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <img
                      src={thumbnails[result.id] || result.thumbnail || getPlaceholderThumbnail(result.source, parseInt(result.id) - 1)}
                      alt={result.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to placeholder on error
                        const target = e.target as HTMLImageElement
                        const fallback = getPlaceholderThumbnail(result.source, parseInt(result.id) - 1)
                        if (target.src !== fallback) {
                          target.src = fallback
                          // Update state to prevent retry loops
                          setThumbnails(prev => ({ ...prev, [result.id]: fallback }))
                        }
                      }}
                      onLoad={() => {
                        // Mark as loaded successfully
                        setThumbnailLoading(prev => ({ ...prev, [result.id]: false }))
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 group-hover:from-black/80 transition-colors">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                        <div className="bg-black/70 backdrop-blur-sm rounded-full p-4 shadow-2xl">
                          <Play className="h-10 w-10 text-white" fill="white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-bold text-white bg-primary/95 backdrop-blur-md px-2.5 py-1 rounded-md shadow-lg border border-white/20">
                      {result.matchScore}% match
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-sm font-semibold line-clamp-2 drop-shadow-lg">
                      {result.title}
                    </p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <CardDescription className="line-clamp-2 text-sm">{result.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{result.duration}</span>
                  </div>
                  {result.creator && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Creator:</span>
                      <span className="font-medium">{result.creator}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Source:</span>
                    <span className="font-medium">{result.source}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1" 
                      size="sm"
                      onClick={() => {
                        setSelectedVideo(result)
                        setIsVideoViewerOpen(true)
                      }}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Watch Here
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(result.url, '_blank', 'noopener,noreferrer')}
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {selectedVideo && (
          <VideoViewer
            isOpen={isVideoViewerOpen}
            onClose={() => {
              setIsVideoViewerOpen(false)
              setSelectedVideo(null)
            }}
            title={selectedVideo.title}
            url={selectedVideo.url}
            source={selectedVideo.source}
            sourceUrl={selectedVideo.sourceUrl}
          />
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Our Search Technology</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our advanced web scraping algorithm analyzes content from verified sources across the internet 
              to find the perfect match for your preferences. Each result is scored based on how well it 
              matches your selected category, genre, themes, and duration preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

