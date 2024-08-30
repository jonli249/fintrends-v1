'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

interface SearchResult {
  term: string;
  date: string;
  value: number;
}

const GoogleTrendsSearch: React.FC = () => {
  const [searchTerms, setSearchTerms] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('day');
  const [geoRestriction, setGeoRestriction] = useState<string>('country');
  const [geoRestrictionOption, setGeoRestrictionOption] = useState<string>('US');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/search_volumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          terms: searchTerms.split(',').map(term => term.trim()),
          start_date: startDate,
          end_date: endDate,
          frequency,
          geo_restriction: geoRestriction,
          geo_restriction_option: geoRestrictionOption,
        }),
      });
      const data: SearchResult[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  const downloadCSV = () => {
    if (!results) return;

    const csvRows = [
      ['Term', 'Date', 'Value'], // CSV header
      ...results.map(result => [result.term, new Date(result.date).toLocaleDateString(), result.value])
    ];

    const csvContent = `data:text/csv;charset=utf-8,${csvRows.map(e => e.join(',')).join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'search_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Google Trends Search</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Enter search terms (comma-separated)"
            value={searchTerms}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerms(e.target.value)}
          />
          <div className="flex space-x-4">
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
            />
          </div>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={geoRestriction} onValueChange={setGeoRestriction}>
            <SelectTrigger>
              <SelectValue placeholder="Select geo restriction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="country">Country</SelectItem>
              <SelectItem value="region">Region</SelectItem>
              <SelectItem value="dma">DMA</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Geo Restriction Option (e.g., US, CA)"
            value={geoRestrictionOption}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGeoRestrictionOption(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
        {results && (
          <Button className="ml-4" onClick={downloadCSV}>
            Download CSV
          </Button>
        )}
      </CardFooter>
      {results && (
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2">Term</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{result.term}</td>
                    <td className="px-4 py-2">{new Date(result.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{result.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default GoogleTrendsSearch;
