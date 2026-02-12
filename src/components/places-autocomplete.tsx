"use client";

import { useEffect, useRef, useState } from "react";

export type PlaceResult = {
  placeId: string;
  name: string;
  address: string;
  mapsUrl: string;
};

type PlacesAutocompleteProps = {
  onPlaceSelect: (place: PlaceResult | null) => void;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
};

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
  }
}

export function PlacesAutocomplete({
  onPlaceSelect,
  defaultValue = "",
  placeholder = "Search for a place...",
  required = false,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn("Google Maps API key not configured");
      return;
    }

    // Check if already loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Load the script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    window.initGoogleMaps = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      delete window.initGoogleMaps;
    };
  }, []);

  // Initialize autocomplete only after 3+ characters
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;
    if (inputValue.length < 3) {
      // Clean up existing autocomplete if input is too short
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
      return;
    }
    if (autocompleteRef.current) return; // Already initialized

    // Mazunte center coordinates
    const mazunteCenter = new google.maps.LatLng(15.6667, -96.5533);

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["establishment", "geocode"],
      // Restrict to ~30km radius around Mazunte (covers Zipolite, San Agustinillo, Puerto Angel)
      locationBias: {
        center: mazunteCenter,
        radius: 30000, // 30km
      },
      fields: ["place_id", "name", "formatted_address", "geometry", "url"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (place.place_id && place.geometry?.location) {
        const result: PlaceResult = {
          placeId: place.place_id,
          name: place.name || "",
          address: place.formatted_address || "",
          mapsUrl: place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        };
        setInputValue(place.name || "");
        onPlaceSelect(result);
      }
    });

    autocompleteRef.current = autocomplete;
  }, [isLoaded, inputValue.length >= 3, onPlaceSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Clear selection if user modifies text
    if (e.target.value === "") {
      onPlaceSelect(null);
    }
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    // Fallback to simple text input
    return (
      <input
        type="text"
        name="venueName"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors"
      />
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      placeholder={isLoaded ? placeholder : "Loading..."}
      disabled={!isLoaded}
      required={required}
      className="w-full px-4 py-3 rounded-xl border-[1.5px] border-black/10 bg-cream text-[0.88rem] outline-none focus:border-ocean transition-colors disabled:opacity-50"
    />
  );
}
