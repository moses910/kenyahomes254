import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  onSearch: (filters: { city: string; propertyType: string; beds: string; baths: string; priceRange: [number, number] }) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchCity, setSearchCity] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [beds, setBeds] = useState<string>('');
  const [baths, setBaths] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch({ city: searchCity, propertyType, beds, baths, priceRange });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Enter city or location..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleSearch} className="md:w-auto">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Property Type</label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Bedrooms</label>
              <Select value={beds} onValueChange={setBeds}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Bathrooms</label>
              <Select value={baths} onValueChange={setBaths}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-medium">
                Price Range: KES {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
              </label>
              <Slider
                min={0}
                max={10000000}
                step={100000}
                value={priceRange}
                onValueChange={(val) => setPriceRange(val as [number, number])}
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
