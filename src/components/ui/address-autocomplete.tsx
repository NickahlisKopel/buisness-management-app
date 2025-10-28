"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "./input"
import { MapPin } from "lucide-react"

interface AddressSuggestion {
  description: string
  placeId?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  lat?: number
  lng?: number
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string, details?: {
    address: string
    city: string
    state: string
    zipCode: string
    lat?: number
    lng?: number
  }) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  required?: boolean
  id?: string
  name?: string
  showMapPreview?: boolean
}

export function AddressAutocomplete({
  value,
  onChange,
  onBlur,
  placeholder = "Start typing an address...",
  className = "",
  required = false,
  id = "address",
  name = "address",
  showMapPreview = false
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const autocompleteService = useRef<any>(null)
  const placesService = useRef<any>(null)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  // Track and stabilize async behavior
  const currentQueryRef = useRef<string>("")
  const abortRef = useRef<AbortController | null>(null)
  const lastFallbackAtRef = useRef<number>(0)
  const cacheRef = useRef<Map<string, { ts: number; items: AddressSuggestion[] }>>(new Map())
  const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
  const [selectedDetails, setSelectedDetails] = useState<{
    address: string
    city: string
    state: string
    zipCode: string
    lat?: number
    lng?: number
  } | null>(null)

  // US State normalization
  const STATE_ABBR: Record<string, string> = {
    'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR', 'CALIFORNIA': 'CA', 'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE', 'FLORIDA': 'FL', 'GEORGIA': 'GA', 'HAWAII': 'HI', 'IDAHO': 'ID', 'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA', 'KANSAS': 'KS', 'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD', 'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS', 'MISSOURI': 'MO', 'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV', 'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY', 'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH', 'OKLAHOMA': 'OK', 'OREGON': 'OR', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC', 'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT', 'VERMONT': 'VT', 'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV', 'WISCONSIN': 'WI', 'WYOMING': 'WY', 'DISTRICT OF COLUMBIA': 'DC', 'WASHINGTON DC': 'DC', 'WASHINGTON, DC': 'DC'
  }

  const normalizeState = (s: string | undefined): string => {
    if (!s) return ''
    const trimmed = s.trim()
    if (trimmed.length === 2) return trimmed.toUpperCase()
    const upper = trimmed.toUpperCase()
    return STATE_ABBR[upper] || trimmed
  }

  const normalizeZip = (z: string | undefined): string => {
    if (!z) return ''
    const zip = String(z).trim()
    const m = zip.match(/^\d{5}(?:-\d{4})?$/)
    return m ? zip : zip
  }

  // Load Google Maps API if API key is available
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (typeof window !== 'undefined' && (window as any).google?.maps) {
      setGoogleMapsLoaded(true)
      return
    }

    // Try to load from env variable (you can add this to .env.local)
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.log("Google Maps API key not found. Address autocomplete will use fallback mode.")
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      setGoogleMapsLoaded(true)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Initialize Google Places services
  useEffect(() => {
    if (googleMapsLoaded && typeof window !== 'undefined' && (window as any).google?.maps) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService()
      const div = document.createElement('div')
      placesService.current = new (window as any).google.maps.places.PlacesService(div)
    }
  }, [googleMapsLoaded])

  const fetchGoogleSuggestions = useCallback((input: string) => {
    if (!autocompleteService.current) return

    setIsLoading(true)
    autocompleteService.current.getPlacePredictions(
      {
        input,
        types: ['address'],
        componentRestrictions: { country: 'us' } // Restrict to US addresses
      },
      (predictions: any, status: any) => {
        setIsLoading(false)
        // Ignore stale results
        if (currentQueryRef.current !== input) return
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(
            predictions.map((prediction: any) => ({
              description: prediction.description,
              placeId: prediction.place_id
            }))
          )
          setShowSuggestions(true)
        } else {
          setSuggestions([])
        }
      }
    )
  }, [])

  const fetchFallbackSuggestions = useCallback(async (input: string) => {
    // Simple fallback using Nominatim (OpenStreetMap) - free, no API key needed
    try {
      // Basic in-memory cache with TTL
      const cached = cacheRef.current.get(input)
      const now = Date.now()
      if (cached && now - cached.ts < CACHE_TTL_MS) {
        setSuggestions(cached.items)
        setShowSuggestions(true)
        return
      }

      // Throttle fallback provider to ~1 req/sec to respect Nominatim guidelines
      const since = now - lastFallbackAtRef.current
      const wait = since < 1000 ? 1000 - since : 0
      if (wait > 0) {
        await new Promise((res) => setTimeout(res, wait))
      }

      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller
      currentQueryRef.current = input

      setIsLoading(true)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&countrycodes=us&addressdetails=1&limit=5`,
        {
          headers: {
            'Accept': 'application/json',
            // Provide an explicit referrer to play nice with Nominatim
            'Referrer-Policy': 'no-referrer-when-downgrade'
          }
        , signal: controller.signal as any
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        // Ignore if the query changed or was aborted
        if (controller.signal.aborted || currentQueryRef.current !== input) return
        const items: AddressSuggestion[] = data.map((item: any) => ({
          description: item.display_name,
          address: item.address?.road || item.address?.hamlet || "",
          city: item.address?.city || item.address?.town || item.address?.village || "",
          state: normalizeState(item.address?.state || ""),
          zipCode: normalizeZip(item.address?.postcode || ""),
          lat: item.lat ? parseFloat(item.lat) : undefined,
          lng: item.lon ? parseFloat(item.lon) : undefined,
        }))
        setSuggestions(items)
        setShowSuggestions(true)
        cacheRef.current.set(input, { ts: Date.now(), items })
        // Simple LRU trim
        if (cacheRef.current.size > 100) {
          const firstKey = cacheRef.current.keys().next().value as string | undefined
          if (firstKey) cacheRef.current.delete(firstKey)
        }
      }
      lastFallbackAtRef.current = Date.now()
    } catch (error) {
      console.error("Error fetching address suggestions:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the API call
    if (newValue.length >= 3) {
      debounceRef.current = setTimeout(() => {
        currentQueryRef.current = newValue
        if (googleMapsLoaded && autocompleteService.current) {
          fetchGoogleSuggestions(newValue)
        } else {
          fetchFallbackSuggestions(newValue)
        }
      }, googleMapsLoaded ? 300 : 600)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const getGooglePlaceDetails = (placeId: string) => {
    if (!placesService.current) return

    placesService.current.getDetails(
      {
        placeId,
        fields: ['address_components', 'formatted_address', 'geometry']
      },
      (place: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place) {
          const addressComponents = place.address_components || []
          
          let streetNumber = ''
          let route = ''
          let city = ''
          let state = ''
          let zipCode = ''
          let lat: number | undefined
          let lng: number | undefined

          addressComponents.forEach((component: any) => {
            const types = component.types
            if (types.includes('street_number')) {
              streetNumber = component.long_name
            } else if (types.includes('route')) {
              route = component.long_name
            } else if (types.includes('locality')) {
              city = component.long_name
            } else if (types.includes('administrative_area_level_1')) {
              state = component.short_name
            } else if (types.includes('postal_code')) {
              zipCode = component.long_name
            }
          })

          if (place.geometry?.location) {
            try {
              lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat
              lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng
            } catch {}
          }

          const address = `${streetNumber} ${route}`.trim()

          const details = {
            address,
            city,
            state,
            zipCode,
            lat,
            lng
          }

          onChange(address, details)
          setSelectedDetails(details)
        }
      }
    )
  }

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    if (suggestion.placeId && googleMapsLoaded) {
      // Google Places API - fetch full details
      getGooglePlaceDetails(suggestion.placeId)
    } else if (suggestion.address) {
      // Fallback API - use what we have
      const details = {
        address: suggestion.address,
        city: suggestion.city || '',
        state: normalizeState(suggestion.state || ''),
        zipCode: normalizeZip(suggestion.zipCode || ''),
        lat: suggestion.lat,
        lng: suggestion.lng
      }
      onChange(suggestion.address, details)
      setSelectedDetails(details)
    } else {
      // Just use the description
      onChange(suggestion.description)
      setSelectedDetails(null)
    }
    
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSuggestionClick(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false)
      setSuggestions([])
      // Ensure normalization if we have details
      if (selectedDetails) {
        const normalized = {
          ...selectedDetails,
          state: normalizeState(selectedDetails.state),
          zipCode: normalizeZip(selectedDetails.zipCode)
        }
        if (normalized.state !== selectedDetails.state || normalized.zipCode !== selectedDetails.zipCode) {
          onChange(normalized.address, normalized)
          setSelectedDetails(normalized)
        }
      }
      onBlur?.()
    }, 200)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={className}
          required={required}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-2 transition-colors ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
              // Use onMouseDown to avoid input blur removing the list before click happens
              onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(suggestion) }}
            >
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-900">{suggestion.description}</span>
            </button>
          ))}
        </div>
      )}

      {!googleMapsLoaded && value.length >= 3 && !isLoading && suggestions.length === 0 && showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
          <p className="text-sm text-gray-500">
            No suggestions found. Try entering more details.
          </p>
        </div>
      )}

      {showMapPreview && selectedDetails?.lat !== undefined && selectedDetails?.lng !== undefined && (
        <div className="mt-2 border rounded overflow-hidden">
          <iframe
            title="Map preview"
            width="100%"
            height="180"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${(selectedDetails.lng - 0.005).toFixed(6)},${(selectedDetails.lat - 0.005).toFixed(6)},${(selectedDetails.lng + 0.005).toFixed(6)},${(selectedDetails.lat + 0.005).toFixed(6)}&layer=mapnik&marker=${selectedDetails.lat.toFixed(6)},${selectedDetails.lng.toFixed(6)}`}
          />
          <div className="p-2 text-xs text-gray-600">
            <a
              className="underline hover:no-underline"
              href={`https://www.openstreetmap.org/?mlat=${selectedDetails.lat}&mlon=${selectedDetails.lng}#map=16/${selectedDetails.lat}/${selectedDetails.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              View on map
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
