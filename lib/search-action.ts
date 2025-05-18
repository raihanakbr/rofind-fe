"use server"

import type { Game } from "./types"

interface SearchResponse {
  took: number
  hits: {
    total: {
      value: number
      relation: string
    }
    hits: Array<{
      _source: any
      highlight?: {
        name?: string[]
        description?: string[]
      }
    }>
  }
  llm_enhancements?: {
    alternative_queries?: string[]
    ranking?: number[]
    analysis?: string
  }
}

export async function searchGames(
  query: string,
  pageSize = 21,
  page = 1,
  maxPages = 10,
  useLLM = false, // New parameter to enable LLM enhancement
): Promise<{ 
  results: Game[]; 
  total: number; 
  currentPage: number; 
  totalPages: number;
  suggestions?: string[]; // New return field for query suggestions
  llmAnalysis?: string; // Optional analysis from LLM
}> {
  try {
    // If no query, return empty results
    if (!query.trim()) {
      return { results: [], total: 0, currentPage: 1, totalPages: 0 }
    }

    // Ensure page is within bounds
    const validPage = Math.min(Math.max(1, page), maxPages)

    // Make API request to backend
    const response = await fetch("http://localhost:8000/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        page_size: pageSize,
        page: validPage,
        use_llm: useLLM, // Add the LLM flag to the request
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("API error:", response.status, response.statusText)
      return { results: [], total: 0, currentPage: validPage, totalPages: 0 }
    }

    const data: SearchResponse = await response.json()
    
    // Extract LLM enhancements if available
    const suggestions = data.llm_enhancements?.alternative_queries || []
    const llmAnalysis = data.llm_enhancements?.analysis

    // Transform API response to our Game type
    const results = data.hits.hits.map((hit) => {
      const source = hit._source

      // Get highlighted name if available
      const highlightedName = hit.highlight?.name?.[0] || source.name

      // Replace <em> tags with span for highlighting
      const formattedName = highlightedName.replace(
        /<em>(.*?)<\/em>/g,
        '<span class="bg-yellow-500/30 text-white font-bold">$1</span>',
      )

      return {
        id: source.id,
        rootPlaceId: source.rootPlaceId,
        name: source.name,
        formattedName: formattedName, // Store the highlighted name
        description: source.description,
        creator: source.creator,
        imageUrl: source.imageUrl, // Use the new imageUrl field
        playing: source.playing,
        visits: source.visits,
        maxPlayers: source.maxPlayers,
        created: source.created,
        updated: source.updated,
        genre: source.genre,
        genre_l1: source.genre_l1,
        genre_l2: source.genre_l2,
        favoritedCount: source.favoritedCount,
        price: source.price,
        // Fallback thumbnail if imageUrl is not available
        thumbnail: source.imageUrl || `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(source.name)}`,
      }
    })

    // Calculate total pages, but cap at maxPages
    const total = data.hits.total.value
    const totalPages = Math.min(Math.ceil(total / pageSize), maxPages)

    // If we have suggestions, persist them to localStorage for client-side access
    if (typeof window !== 'undefined' && suggestions.length > 0) {
      localStorage.setItem('querysuggestions', JSON.stringify(suggestions))
    }

    return {
      results,
      total,
      currentPage: validPage,
      totalPages,
      suggestions,
      llmAnalysis,
    }
  } catch (error) {
    console.error("Error searching games:", error)
    return { results: [], total: 0, currentPage: page, totalPages: 0 }
  }
}
