"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { countries, type Country } from "@/data/countries"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CountrySelectProps {
  value: string
  onChange: (value: string) => void
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
  const [search, setSearch] = React.useState("")
  const [filteredCountries, setFilteredCountries] = React.useState(countries)

  React.useEffect(() => {
    const filtered = countries.filter(
      country =>
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.dial_code.includes(search)
    )
    setFilteredCountries(filtered)
  }, [search])

  const selectedCountry = countries.find(c => c.dial_code === value)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[130px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span>{selectedCountry?.flag}</span>
            <span>{selectedCountry?.dial_code}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="flex items-center px-3 pb-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filteredCountries.map((country) => (
          <SelectItem key={country.code} value={country.dial_code}>
            <div className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
              <span className="ml-auto text-gray-500">{country.dial_code}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
