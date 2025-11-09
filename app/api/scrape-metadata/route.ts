import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route for scraping video metadata from adult content sites
 * 
 * DISCLAIMER: This is for educational/satirical purposes only.
 * Scraping content from these sites may violate their Terms of Service.
 * This code is not intended for production use.
 * 
 * This route scrapes search results pages to extract:
 * - Video titles
 * - Thumbnails
 * - Creator/uploader names
 * - Video durations
 * - Direct video URLs
 */

interface VideoMetadata {
  title: string
  thumbnail: string
  creator?: string
  duration?: string
  url: string
  source: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const source = searchParams.get('source')
  const searchQuery = searchParams.get('query')
  const limit = parseInt(searchParams.get('limit') || '3')

  if (!source || !searchQuery) {
    return NextResponse.json(
      { error: 'Missing source or query parameter' },
      { status: 400 }
    )
  }

  try {
    const metadata = await scrapeMetadata(source, searchQuery, limit)
    return NextResponse.json({ metadata })
  } catch (error) {
    console.error('Error scraping metadata:', error)
    return NextResponse.json(
      { error: 'Failed to scrape metadata', metadata: [] },
      { status: 500 }
    )
  }
}

async function scrapeMetadata(
  source: string,
  searchQuery: string,
  limit: number
): Promise<VideoMetadata[]> {
  let searchUrl = ''

  // Build search URL based on source
  switch (source.toLowerCase()) {
    case 'pornhub':
      searchUrl = `https://www.pornhub.com/video/search?search=${encodeURIComponent(searchQuery)}`
      break
    case 'xvideos':
      searchUrl = `https://www.xvideos.com/?k=${encodeURIComponent(searchQuery)}`
      break
    case 'xhamster':
      searchUrl = `https://www.xhamster.com/search/${encodeURIComponent(searchQuery)}`
      break
    default:
      throw new Error(`Unsupported source: ${source}`)
  }

  try {
    // Fetch the search page with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.google.com/',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const metadata = parseMetadata(html, source, limit)
    
    // Return empty array if no metadata found (better than throwing)
    return metadata
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Timeout fetching ${source}`)
    } else {
      console.error(`Error fetching ${source}:`, error)
    }
    // Return empty array on error - client will handle fallback
    return []
  }
}

function parseMetadata(html: string, source: string, limit: number): VideoMetadata[] {
  const metadata: VideoMetadata[] = []

  try {
    switch (source.toLowerCase()) {
      case 'pornhub':
        return parsePornhubMetadata(html, limit)
      case 'xvideos':
        return parseXVideosMetadata(html, limit)
      case 'xhamster':
        return parseXHamsterMetadata(html, limit)
      default:
        return []
    }
  } catch (error) {
    console.error(`Error parsing ${source} metadata:`, error)
    return []
  }
}

function parsePornhubMetadata(html: string, limit: number): VideoMetadata[] {
  const metadata: VideoMetadata[] = []
  
  // Decode HTML entities helper
  const decodeHtml = (str: string): string => {
    return str
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#x60;/g, '`')
      .replace(/&#x3D;/g, '=')
  }
  
  // Try multiple patterns to find video containers
  // Pattern 1: Look for video list items with data-video-id
  let videoRegex = /<li[^>]*data-video-id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/li>/gi
  let videos = Array.from(html.matchAll(videoRegex))
  
  // Pattern 2: If no results, try looking for any li with view_video.php links
  if (videos.length === 0) {
    videoRegex = /<li[^>]*>([\s\S]*?view_video\.php[\s\S]*?)<\/li>/gi
    videos = Array.from(html.matchAll(videoRegex))
  }
  
  // Pattern 3: Look for div containers with video links
  if (videos.length === 0) {
    videoRegex = /<div[^>]*>([\s\S]*?view_video\.php[\s\S]*?)<\/div>/gi
    videos = Array.from(html.matchAll(videoRegex))
  }
  
  // Pattern 4: Direct search for view_video.php links with context
  if (videos.length === 0) {
    const linkMatches = Array.from(html.matchAll(/view_video\.php\?viewkey=([^"'\s&"'>]+)/gi))
    if (linkMatches.length > 0) {
      // For each viewkey, get surrounding HTML context
      linkMatches.slice(0, limit).forEach(match => {
        const viewkey = match[1]
        const matchIndex = match.index || 0
        const contextStart = Math.max(0, matchIndex - 500)
        const contextEnd = Math.min(html.length, matchIndex + 500)
        const context = html.substring(contextStart, contextEnd)
        videos.push([match[0], viewkey, context])
      })
    }
  }
  
  const videoMatches = videos.slice(0, limit)

  for (const match of videoMatches) {
    // Handle different match structures from different patterns
    let videoHtml = ''
    let videoId = ''
    let viewkeyFromMatch = ''
    
    if (match.length === 3 && match[2]) {
      // Pattern 4: [fullMatch, viewkey, context]
      videoHtml = match[2]
      viewkeyFromMatch = match[1]
    } else if (match[2]) {
      // Pattern 1-3: [fullMatch, videoId, htmlContent]
      videoHtml = match[2]
      videoId = match[1]?.match(/data-video-id=["']([^"']+)["']/)?.[1] || match[1] || ''
    } else {
      videoHtml = match[1] || match[0]
      videoId = match[1]?.match(/data-video-id=["']([^"']+)["']/)?.[1] || ''
    }

    // Extract title - try multiple patterns
    let title = ''
    let viewkey = viewkeyFromMatch || ''
    
    // Extract viewkey if not already set
    if (!viewkey) {
      const viewkeyMatch = videoHtml.match(/viewkey=([^"'\s&"'>]+)/i)
      viewkey = viewkeyMatch ? viewkeyMatch[1] : videoId
    }
    
    // Pattern 1: Look for title in link href with viewkey
    const titlePatterns = [
      /<a[^>]*href=["']\/view_video\.php\?viewkey=[^"']+["'][^>]*title=["']([^"']+)["']/i,
      /<a[^>]*title=["']([^"']+)["'][^>]*href=["']\/view_video\.php\?viewkey=[^"']+["']/i,
      /<a[^>]*href=["']\/view_video\.php\?viewkey=[^"']+["'][^>]*>([\s\S]{10,150}?)<\/a>/i,
      /<span[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,
      /<div[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i,
      /title=["']([^"']{10,150})["']/i,
    ]
    
    for (const pattern of titlePatterns) {
      const titleMatch = videoHtml.match(pattern)
      if (titleMatch && titleMatch[1]) {
        title = decodeHtml(titleMatch[1].replace(/<[^>]*>/g, '')).trim()
        // Validate it's a reasonable title
        if (title && title.length >= 5 && title.length < 200 && !title.match(/^\d+:\d+$/)) {
          break
        } else {
          title = '' // Reset if invalid
        }
      }
    }
    
    // If still no title, try a broader search in the HTML block
    if (!title) {
      // Remove scripts and styles
      const cleanHtml = videoHtml.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
      
      // Look for any text between tags that might be a title
      const textMatches = cleanHtml.match(/<[^>]+>([^<]{10,80})<\/[^>]+>/g)
      if (textMatches) {
        for (const textMatch of textMatches) {
          const text = textMatch.replace(/<[^>]*>/g, '').trim()
          // Skip common non-title text
          if (text && 
              text.length > 10 && 
              !text.match(/^\d+:\d+$/) && // Not duration
              !text.match(/^\d+[kKmM]? views?$/i) && // Not views
              !text.match(/^https?:\/\//) && // Not URL
              text.length < 150) {
            title = text
            break
          }
        }
      }
    }
    
    if (!title || title.length < 5) {
      continue // Skip if we can't find a valid title
    }

    // Ensure we have a viewkey
    if (!viewkey || viewkey.length < 5) {
      const viewkeyMatch = videoHtml.match(/viewkey=([^"'\s&"'>]+)/i)
      viewkey = viewkeyMatch ? viewkeyMatch[1] : (videoId || '')
    }

    // Extract thumbnail - try multiple patterns (Pornhub specific)
    // Priority: data attributes > CDN URLs > generic img tags
    let thumbnail = ''
    
    // Pattern 1: data-mediumthumb (Pornhub's primary thumbnail attribute)
    const mediumthumbMatch = videoHtml.match(/data-mediumthumb=["']([^"']+)["']/i)
    if (mediumthumbMatch && mediumthumbMatch[1]) {
      thumbnail = mediumthumbMatch[1].trim()
    }
    
    // Pattern 2: data-mediabook (alternative Pornhub attribute)
    if (!thumbnail) {
      const mediabookMatch = videoHtml.match(/data-mediabook=["']([^"']+)["']/i)
      if (mediabookMatch && mediabookMatch[1]) {
        thumbnail = mediabookMatch[1].trim()
      }
    }
    
    // Pattern 3: Look for img tags with phncdn (Pornhub CDN) - prioritize ones near viewkey
    if (!thumbnail) {
      // First, try to find img near the viewkey link
      if (viewkey) {
        const viewkeyIndex = videoHtml.indexOf(viewkey)
        if (viewkeyIndex > -1) {
          const contextAroundViewkey = videoHtml.substring(Math.max(0, viewkeyIndex - 300), viewkeyIndex + 500)
          const phncdnMatch = contextAroundViewkey.match(/<img[^>]*src=["']([^"']*phncdn[^"']*)["']/i)
          if (phncdnMatch && phncdnMatch[1] && 
              !phncdnMatch[1].includes('logo') && 
              !phncdnMatch[1].includes('icon') &&
              (phncdnMatch[1].includes('thumb') || phncdnMatch[1].match(/\.(jpg|jpeg|png|webp)/i))) {
            thumbnail = phncdnMatch[1].trim()
          }
        }
      }
      
      // Fallback: search entire video block
      if (!thumbnail) {
        const phncdnMatches = Array.from(videoHtml.matchAll(/<img[^>]*src=["']([^"']*phncdn[^"']*)["']/gi))
        for (const match of phncdnMatches) {
          if (match[1] && 
              !match[1].includes('logo') && 
              !match[1].includes('icon') &&
              (match[1].includes('thumb') || match[1].match(/\.(jpg|jpeg|png|webp)/i))) {
            thumbnail = match[1].trim()
            break
          }
        }
      }
    }
    
    // Pattern 4: Look for img with thumb in class (within the video container)
    if (!thumbnail) {
      // Look for images with thumb-related classes near the viewkey
      const thumbClassPattern = /<img[^>]*class=["'][^"']*(?:thumb|thumbnail|preview)[^"']*["'][^>]*src=["']([^"']+)["']/i
      const thumbClassMatch = videoHtml.match(thumbClassPattern)
      if (thumbClassMatch && thumbClassMatch[1] &&
          !thumbClassMatch[1].includes('data:image') &&
          !thumbClassMatch[1].includes('logo') &&
          !thumbClassMatch[1].includes('icon') &&
          thumbClassMatch[1].match(/\.(jpg|jpeg|png|webp)/i)) {
        thumbnail = thumbClassMatch[1].trim()
      }
    }
    
    // Pattern 5: data-src attribute with thumb (lazy loaded images)
    if (!thumbnail) {
      const dataSrcMatch = videoHtml.match(/data-src=["']([^"']*thumb[^"']*\.(jpg|jpeg|png|webp))["']/i)
      if (dataSrcMatch && dataSrcMatch[1] &&
          !dataSrcMatch[1].includes('logo') &&
          !dataSrcMatch[1].includes('icon')) {
        thumbnail = dataSrcMatch[1].trim()
      }
    }
    
    // Pattern 6: Look for the first valid image in the video container (last resort)
    if (!thumbnail) {
      // Get all img tags and find the one that looks most like a video thumbnail
      const allImages = Array.from(videoHtml.matchAll(/<img[^>]*src=["']([^"']+)["']/gi))
      for (const imgMatch of allImages) {
        if (imgMatch[1] &&
            imgMatch[1].startsWith('http') &&
            !imgMatch[1].includes('data:image') &&
            !imgMatch[1].includes('logo') &&
            !imgMatch[1].includes('icon') &&
            !imgMatch[1].includes('avatar') &&
            !imgMatch[1].includes('profile') &&
            (imgMatch[1].includes('thumb') ||
             imgMatch[1].includes('phncdn') ||
             imgMatch[1].match(/\.(jpg|jpeg|png|webp)/i))) {
          thumbnail = imgMatch[1].trim()
          break
        }
      }
    }
    
    // Clean and normalize thumbnail URL
    if (thumbnail) {
      // Decode HTML entities
      thumbnail = decodeHtml(thumbnail)
      
      // Remove fragment identifiers but keep query params (they might be needed)
      thumbnail = thumbnail.split('#')[0]
      
      // Make absolute URL if relative
      if (!thumbnail.startsWith('http')) {
        if (thumbnail.startsWith('//')) {
          thumbnail = 'https:' + thumbnail
        } else if (thumbnail.startsWith('/')) {
          thumbnail = 'https://www.pornhub.com' + thumbnail
        } else {
          thumbnail = 'https://www.pornhub.com/' + thumbnail
        }
      }
      
      // Validate final URL - ensure it's a valid image URL
      // Don't require file extension for CDN URLs as they might not have one
      const isValidThumbnail = thumbnail.match(/\.(jpg|jpeg|png|webp|gif|webp)/i) || 
                                thumbnail.includes('phncdn') || 
                                thumbnail.includes('thumb') ||
                                thumbnail.includes('mediacdn') ||
                                thumbnail.includes('cdn')
      
      if (isValidThumbnail) {
        // Validate URL format (but don't fail if it's a CDN URL without extension)
        try {
          const url = new URL(thumbnail)
          // Ensure it's http or https
          if (!['http:', 'https:'].includes(url.protocol)) {
            thumbnail = ''
          }
        } catch (e) {
          // If URL parsing fails, it might still be valid if it's a CDN URL
          // Only reject if it clearly looks invalid
          if (!thumbnail.includes('cdn') && !thumbnail.includes('phncdn')) {
            thumbnail = ''
          }
        }
      } else {
        thumbnail = '' // Invalid thumbnail
      }
    }

    // Extract duration
    const durationPatterns = [
      /<var[^>]*class=["'][^"']*duration[^"']*["'][^>]*>([\d:]+)<\/var>/i,
      /<span[^>]*class=["'][^"']*duration[^"']*["'][^>]*>([\d:]+)<\/span>/i,
      /duration["']?[^>]*>([\d:]+)</i,
    ]
    
    let duration = ''
    for (const pattern of durationPatterns) {
      const durationMatch = videoHtml.match(pattern)
      if (durationMatch) {
        duration = durationMatch[1]
        break
      }
    }

    // Extract creator/uploader
    const creatorPatterns = [
      /<a[^>]*class=["'][^"']*username[^"']*["'][^>]*>([\s\S]*?)<\/a>/i,
      /<span[^>]*class=["'][^"']*username[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,
      /by\s+<a[^>]*>([\s\S]*?)<\/a>/i,
    ]
    
    let creator: string | undefined = undefined
    for (const pattern of creatorPatterns) {
      const creatorMatch = videoHtml.match(pattern)
      if (creatorMatch) {
        creator = creatorMatch[1].replace(/<[^>]*>/g, '').trim()
        if (creator) break
      }
    }

    // Build video URL
    const url = viewkey 
      ? `https://www.pornhub.com/view_video.php?viewkey=${viewkey}`
      : `https://www.pornhub.com/video/search?search=`

    // Only add if we have at least a title
    if (title && title !== 'Untitled Video') {
      metadata.push({
        title: title.substring(0, 150).trim(),
        thumbnail: thumbnail || '',
        creator: creator || undefined,
        duration: duration || undefined,
        url,
        source: 'Pornhub',
      })
    }
  }

  return metadata
}

function parseXVideosMetadata(html: string, limit: number): VideoMetadata[] {
  const metadata: VideoMetadata[] = []
  
  // Decode HTML entities helper
  const decodeHtml = (str: string): string => {
    return str
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#x60;/g, '`')
      .replace(/&#x3D;/g, '=')
  }

  // Try multiple patterns to find video containers
  // Pattern 1: Look for thumb-block divs
  let videoRegex = /<div[^>]*class=["'][^"']*thumb-block[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi
  let videos = Array.from(html.matchAll(videoRegex))
  
  // Pattern 2: Look for any div containing video links
  if (videos.length === 0) {
    videoRegex = /<div[^>]*>([\s\S]*?\/video\d+[\s\S]*?)<\/div>/gi
    videos = Array.from(html.matchAll(videoRegex))
  }
  
  // Pattern 3: Look for items with video URLs
  if (videos.length === 0) {
    videoRegex = /<[^>]*>([\s\S]*?href=["'][^"']*\/video\d+[^"']*["'][\s\S]*?)<\/[^>]*>/gi
    videos = Array.from(html.matchAll(videoRegex))
  }
  
  // Pattern 4: Direct search for /video URLs with context
  if (videos.length === 0) {
    const linkMatches = Array.from(html.matchAll(/href=["']([^"']*\/video\d+[^"']*)["']/gi))
    if (linkMatches.length > 0) {
      linkMatches.slice(0, limit).forEach(match => {
        const videoPath = match[1]
        const matchIndex = match.index || 0
        const contextStart = Math.max(0, matchIndex - 500)
        const contextEnd = Math.min(html.length, matchIndex + 500)
        const context = html.substring(contextStart, contextEnd)
        videos.push([match[0], videoPath, context])
      })
    }
  }
  
  const videoMatches = videos.slice(0, limit)

  for (const match of videoMatches) {
    // Handle different match structures from different patterns
    let videoHtml = ''
    let videoPathFromMatch = ''
    
    if (match.length === 3 && match[2]) {
      // Pattern 4: [fullMatch, videoPath, context]
      videoHtml = match[2]
      videoPathFromMatch = match[1]
    } else {
      videoHtml = match[1] || match[0]
    }

    // Extract title and URL - try multiple patterns
    let title = ''
    let videoPath = videoPathFromMatch || ''
    
    // Extract video path first if not already set
    if (!videoPath) {
      const pathMatch = videoHtml.match(/href=["']([^"']*\/video\d+[^"']*)["']/i)
      videoPath = pathMatch ? pathMatch[1] : ''
    }
    
    const titlePatterns = [
      // Pattern 1: Title attribute in link (most reliable)
      /<a[^>]*href=["'][^"']*\/video\d+[^"']*["'][^>]*title=["']([^"']{10,150})["']/i,
      /<a[^>]*title=["']([^"']{10,150})["'][^>]*href=["'][^"']*\/video\d+[^"']*["']/i,
      // Pattern 2: Title in paragraph with link
      /<p[^>]*class=["'][^"']*title[^"']*["'][^>]*><a[^>]*href=["'][^"']*\/video\d+[^"']*["'][^>]*>([\s\S]{10,150}?)<\/a><\/p>/i,
      // Pattern 3: Link text content
      /<a[^>]*href=["'][^"']*\/video\d+[^"']*["'][^>]*>([\s\S]{10,150}?)<\/a>/i,
      // Pattern 4: Title in span or div near video link
      /<span[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,
      /<div[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i,
    ]
    
    for (const pattern of titlePatterns) {
      const titleMatch = videoHtml.match(pattern)
      if (titleMatch && titleMatch[1]) {
        title = decodeHtml(titleMatch[1].replace(/<[^>]*>/g, '')).trim()
        // Validate it's a reasonable title
        if (title && title.length >= 5 && title.length < 200 && !title.match(/^\d+:\d+$/)) {
          break
        } else {
          title = '' // Reset if invalid
        }
      }
    }
    
    // If we have videoPath but no title, try to extract title from the link text
    if (!title && videoPath) {
      // Escape special regex characters in videoPath
      const escapedPath = videoPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const linkMatch = videoHtml.match(new RegExp(`<a[^>]*href=["']${escapedPath}["'][^>]*>([\\s\\S]*?)<\\/a>`, 'i'))
      if (linkMatch && linkMatch[1]) {
        title = decodeHtml(linkMatch[1].replace(/<[^>]*>/g, '')).trim()
      }
    }
    
    // Extract video path if not found - try multiple patterns
    if (!videoPath) {
      const pathPatterns = [
        /href=["']([^"']*\/video\d+[^"']*)["']/i,
        /href=["']([^"']*\/\d+\/[^"']*)["']/i,
        /\/video(\d+)/i,
      ]
      
      for (const pattern of pathPatterns) {
        const pathMatch = videoHtml.match(pattern)
        if (pathMatch && pathMatch[1]) {
          videoPath = pathMatch[1].startsWith('/') ? pathMatch[1] : `/video${pathMatch[1]}`
          break
        }
      }
    }
    
    // Final fallback: try to find title in surrounding text if we have video path
    if (!title && videoPath) {
      const cleanHtml = videoHtml.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
      // Look for text near the video link
      const nearbyText = cleanHtml.split(videoPath)[0]?.slice(-200) || ''
      const textMatch = nearbyText.match(/>([^<]{15,100})</)
      if (textMatch) {
        title = textMatch[1].trim()
      }
    }
    
    if (!title || title.length < 5 || !videoPath) {
      continue // Skip if we can't find a valid title or video path
    }

    // Extract thumbnail - try multiple patterns (XVideos specific)
    // Priority: id="pic" > CDN URLs > thumb in class > generic img tags
    let thumbnail = ''
    
    // Pattern 1: img with id="pic" (XVideos' primary thumbnail identifier)
    const picMatch = videoHtml.match(/<img[^>]*id=["']pic["'][^>]*(?:src|data-src)=["']([^"']+)["']/i)
    if (picMatch && picMatch[1]) {
      thumbnail = picMatch[1].trim()
    }
    
    // Pattern 2: Look for xvideos-cdn URLs (XVideos CDN) - prioritize ones near video path
    if (!thumbnail) {
      // First, try to find img near the video path
      if (videoPath) {
        const videoPathIndex = videoHtml.indexOf(videoPath)
        if (videoPathIndex > -1) {
          const contextAroundPath = videoHtml.substring(Math.max(0, videoPathIndex - 300), videoPathIndex + 500)
          const cdnMatch = contextAroundPath.match(/<img[^>]*src=["']([^"']*xvideos-cdn[^"']*)["']/i)
          if (cdnMatch && cdnMatch[1] && 
              !cdnMatch[1].includes('logo') && 
              !cdnMatch[1].includes('icon') &&
              (cdnMatch[1].includes('img-') || cdnMatch[1].includes('thumb') || cdnMatch[1].match(/\.(jpg|jpeg|png|webp)/i))) {
            thumbnail = cdnMatch[1].trim()
          }
        }
      }
      
      // Fallback: search entire video block
      if (!thumbnail) {
        const cdnMatches = Array.from(videoHtml.matchAll(/<img[^>]*src=["']([^"']*xvideos-cdn[^"']*)["']/gi))
        for (const match of cdnMatches) {
          if (match[1] && 
              !match[1].includes('logo') && 
              !match[1].includes('icon') &&
              (match[1].includes('img-') || match[1].includes('thumb') || match[1].match(/\.(jpg|jpeg|png|webp)/i))) {
            thumbnail = match[1].trim()
            break
          }
        }
      }
    }
    
    // Pattern 3: img with thumb in class
    if (!thumbnail) {
      const thumbClassMatch = videoHtml.match(/<img[^>]*class=["'][^"']*thumb[^"']*["'][^>]*src=["']([^"']+)["']/i)
      if (thumbClassMatch && thumbClassMatch[1] &&
          !thumbClassMatch[1].includes('logo') &&
          !thumbClassMatch[1].includes('icon') &&
          thumbClassMatch[1].match(/\.(jpg|jpeg|png|webp)/i)) {
        thumbnail = thumbClassMatch[1].trim()
      }
    }
    
    // Pattern 4: data-src with thumb or image extension
    if (!thumbnail) {
      const dataSrcMatches = Array.from(videoHtml.matchAll(/data-src=["']([^"']+\.(jpg|jpeg|png|webp))["']/gi))
      for (const match of dataSrcMatches) {
        if (match[1] && 
            !match[1].includes('data:image') &&
            !match[1].includes('logo') &&
            !match[1].includes('icon') &&
            (match[1].includes('thumb') || match[1].includes('img-'))) {
          thumbnail = match[1].trim()
          break
        }
      }
    }
    
    // Pattern 5: Look for images with thumb in class near video path
    if (!thumbnail && videoPath) {
      const videoPathIndex = videoHtml.indexOf(videoPath)
      if (videoPathIndex > -1) {
        const contextAroundPath = videoHtml.substring(Math.max(0, videoPathIndex - 200), videoPathIndex + 300)
        const thumbClassMatch = contextAroundPath.match(/<img[^>]*class=["'][^"']*thumb[^"']*["'][^>]*src=["']([^"']+)["']/i)
        if (thumbClassMatch && thumbClassMatch[1] &&
            !thumbClassMatch[1].includes('logo') &&
            !thumbClassMatch[1].includes('icon') &&
            thumbClassMatch[1].match(/\.(jpg|jpeg|png|webp)/i)) {
          thumbnail = thumbClassMatch[1].trim()
        }
      }
    }
    
    // Pattern 6: Any img src with image extension in the video block (last resort)
    if (!thumbnail) {
      // Get all img tags and prioritize ones that look like video thumbnails
      const allImages = Array.from(videoHtml.matchAll(/<img[^>]*(?:src|data-src)=["']([^"']+)["']/gi))
      for (const imgMatch of allImages) {
        if (imgMatch[1] &&
            !imgMatch[1].includes('data:image') &&
            !imgMatch[1].includes('logo') &&
            !imgMatch[1].includes('icon') &&
            !imgMatch[1].includes('avatar') &&
            !imgMatch[1].includes('profile') &&
            !imgMatch[1].includes('button') &&
            (imgMatch[1].includes('thumb') ||
             imgMatch[1].includes('xvideos') ||
             imgMatch[1].includes('img-') ||
             imgMatch[1].match(/\.(jpg|jpeg|png|webp)/i))) {
          thumbnail = imgMatch[1].trim()
          break
        }
      }
    }
    
    // Clean and normalize thumbnail URL
    if (thumbnail) {
      // Decode HTML entities
      thumbnail = decodeHtml(thumbnail)
      
      // Remove fragment identifiers but keep query params
      thumbnail = thumbnail.split('#')[0]
      
      // Make absolute URL if relative
      if (!thumbnail.startsWith('http')) {
        if (thumbnail.startsWith('//')) {
          thumbnail = 'https:' + thumbnail
        } else if (thumbnail.startsWith('/')) {
          thumbnail = 'https://www.xvideos.com' + thumbnail
        } else {
          thumbnail = 'https://www.xvideos.com/' + thumbnail
        }
      }
      
      // Validate final URL - ensure it's a valid image URL
      // Don't require file extension for CDN URLs as they might not have one
      const isValidThumbnail = thumbnail.match(/\.(jpg|jpeg|png|webp|gif)/i) || 
                                thumbnail.includes('xvideos-cdn') || 
                                thumbnail.includes('thumb') ||
                                thumbnail.includes('img-') ||
                                thumbnail.includes('cdn')
      
      if (isValidThumbnail) {
        // Validate URL format (but don't fail if it's a CDN URL without extension)
        try {
          const url = new URL(thumbnail)
          // Ensure it's http or https
          if (!['http:', 'https:'].includes(url.protocol)) {
            thumbnail = ''
          }
        } catch (e) {
          // If URL parsing fails, it might still be valid if it's a CDN URL
          // Only reject if it clearly looks invalid
          if (!thumbnail.includes('cdn') && !thumbnail.includes('xvideos-cdn')) {
            thumbnail = ''
          }
        }
      } else {
        thumbnail = '' // Invalid thumbnail
      }
    }

    // Extract duration
    const durationPatterns = [
      /<span[^>]*class=["'][^"']*duration[^"']*["'][^>]*>([\d:]+)<\/span>/i,
      /duration["']?[^>]*>([\d:]+)</i,
      /<span[^>]*>([\d:]+)<\/span>/i,
    ]
    
    let duration = ''
    for (const pattern of durationPatterns) {
      const durationMatch = videoHtml.match(pattern)
      if (durationMatch && durationMatch[1].match(/^\d+:\d+$/)) {
        duration = durationMatch[1]
        break
      }
    }

    // Extract uploader/creator
    const creatorPatterns = [
      /<p[^>]*class=["'][^"']*name[^"']*["'][^>]*><a[^>]*>([\s\S]*?)<\/a><\/p>/i,
      /<span[^>]*class=["'][^"']*name[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,
      /by\s+<a[^>]*>([\s\S]*?)<\/a>/i,
    ]
    
    let creator: string | undefined = undefined
    for (const pattern of creatorPatterns) {
      const creatorMatch = videoHtml.match(pattern)
      if (creatorMatch) {
        creator = creatorMatch[1].replace(/<[^>]*>/g, '').trim()
        if (creator) break
      }
    }

    // Build video URL
    const url = videoPath.startsWith('http')
      ? videoPath
      : `https://www.xvideos.com${videoPath}`

    // Only add if we have a valid title
    if (title && title !== 'Untitled Video') {
      metadata.push({
        title: title.substring(0, 150).trim(),
        thumbnail: thumbnail || '',
        creator: creator || undefined,
        duration: duration || undefined,
        url,
        source: 'XVideos',
      })
    }
  }

  return metadata
}

function parseXHamsterMetadata(html: string, limit: number): VideoMetadata[] {
  const metadata: VideoMetadata[] = []

  // XHamster pattern - looks for video items
  // Pattern: <div class="thumb-list__item">
  const videoRegex = /<div[^>]*class=["'][^"']*thumb-list__item[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi
  const videos = Array.from(html.matchAll(videoRegex)).slice(0, limit)

  for (const match of videos) {
    const videoHtml = match[1]

    // Extract title and URL
    const titleMatch = videoHtml.match(/<a[^>]*class=["'][^"']*video-thumb__image-container[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<img[^>]*alt=["']([^"']+)["']/i) ||
      videoHtml.match(/<a[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<img[^>]*alt=["']([^"']+)["']/i)
    const title = titleMatch
      ? titleMatch[2].replace(/<[^>]*>/g, '').trim()
      : 'Untitled Video'
    const videoPath = titleMatch ? titleMatch[1] : ''

    // Extract thumbnail
    const thumbMatch = videoHtml.match(/<img[^>]*src=["']([^"']+)["']/i) ||
      videoHtml.match(/data-src=["']([^"']+)["']/i) ||
      videoHtml.match(/srcset=["']([^"']+)["']/i)
    const thumbnail = thumbMatch
      ? thumbMatch[1].split(' ')[0] // Take first URL from srcset if present
      : ''

    // Extract duration
    const durationMatch = videoHtml.match(/<span[^>]*class=["'][^"']*duration[^"']*["'][^>]*>([\d:]+)<\/span>/i)
    const duration = durationMatch ? durationMatch[1] : ''

    // Extract uploader
    const uploaderMatch = videoHtml.match(/<a[^>]*class=["'][^"']*video-channel-name[^"']*["'][^>]*>([\s\S]*?)<\/a>/i)
    const creator = uploaderMatch
      ? uploaderMatch[1].replace(/<[^>]*>/g, '').trim()
      : undefined

    // Build video URL
    const url = videoPath.startsWith('http')
      ? videoPath
      : `https://www.xhamster.com${videoPath}`

    if (title && thumbnail) {
      metadata.push({
        title: title.substring(0, 100),
        thumbnail: thumbnail.startsWith('http') ? thumbnail : `https://www.xhamster.com${thumbnail}`,
        creator,
        duration,
        url,
        source: 'XHamster',
      })
    }
  }

  return metadata
}

