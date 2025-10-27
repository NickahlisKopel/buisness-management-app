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
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string, details?: {
    address: string
    city: string
    state: string
    zipCode: string
  }) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  required?: boolean
  id?: string
  name?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onBlur,
  placeholder = "Start typing an address...",
  className = "",
  required = false,
  id = "address",
  name = "address"
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
      setIsLoading(true)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&countrycodes=us&addressdetails=1&limit=5`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setSuggestions(
          data.map((item: any) => ({
            description: item.display_name,
            address: item.address?.road || item.address?.hamlet || "",
            city: item.address?.city || item.address?.town || item.address?.village || "",
            state: item.address?.state || "",
            zipCode: item.address?.postcode || ""
          }))
        )
        setShowSuggestions(true)
      }
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
        if (googleMapsLoaded && autocompleteService.current) {
          fetchGoogleSuggestions(newValue)
        } else {
          fetchFallbackSuggestions(newValue)
        }
      }, 300)
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
        fields: ['address_components', 'formatted_address']
      },
      (place: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place) {
          const addressComponents = place.address_components || []
          
          let streetNumber = ''
          let route = ''
          let city = ''
          let state = ''
          let zipCode = ''

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

          const address = `${streetNumber} ${route}`.trim()

          onChange(address, {
            address,
            city,
            state,
            zipCode
          })
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
      onChange(suggestion.address, {
        address: suggestion.address,
        city: suggestion.city || '',
        state: suggestion.state || '',
        zipCode: suggestion.zipCode || ''
      })
    } else {
      // Just use the description
      onChange(suggestion.description)
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
              onClick={() => handleSuggestionClick(suggestion)}
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
    </div>
  )
}
