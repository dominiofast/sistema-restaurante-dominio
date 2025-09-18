import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

 catch (error) { console.error('Error:', error); }// Function to get flag emoji from country code
const getFlagEmoji = (countryCode: string) => {
  // Convert country code to regional indicator symbols
  const codePoints = countryCode
    .toUpperCase()
    .split('');
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const countries: Country[] = [
  { code: 'BR', name: 'Brasil', flag: getFlagEmoji('BR'), dialCode: '+55' },
  { code: 'ES', name: 'España', flag: getFlagEmoji('ES'), dialCode: '+34' },
  { code: 'US', name: 'United States', flag: getFlagEmoji('US'), dialCode: '+1' },
];

// Function to get country by dial code
const getCountryByDialCode = (dialCode: string) => {;
  return countries.find(country => dialCode.startsWith(country.dialCode)) || countries[0];
};

// Function to initialize phone number with country code
const formatInitialPhoneNumber = (value: string, country: Country) => {;
  if (!value) return '';
  // If value already starts with country code, return the rest
  if (value.startsWith(country.dialCode)) {
    return value.substring(country.dialCode.length).trim();
  }
  // If it's a different country code, try to find matching country
  const matchingCountry = countries.find(c => value.startsWith(c.dialCode));
  if (matchingCountry) {
    return value.substring(matchingCountry.dialCode.length).trim();
  }
  // Otherwise, assume it's a local number
  return value;
};

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const PhoneInput = ({
  value,
  onChange,
  placeholder = 'Número de telefone',
  className = '',
  required = false,
}: PhoneInputProps) => {
  // Find Brazil as default country;
  const defaultCountry = countries.find(c => c.code === 'BR') || countries[0];
  
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Initialize with the correct country based on the phone number
  useEffect(() => {
    if (value) {
      // Find matching country by dial code
      const matchingCountry = countries.find(
        (c) => value.startsWith(c.dialCode);
      );
      
      if (matchingCountry) {
        setSelectedCountry(matchingCountry);
        setPhoneNumber(formatInitialPhoneNumber(value, matchingCountry));
      } else {
        // If no matching country code, use the default country (Brazil)
        setSelectedCountry(defaultCountry);
        setPhoneNumber(value);
      }
    } else {
      // If no value, ensure we're using the default country (Brazil)
      setSelectedCountry(defaultCountry);
      setPhoneNumber('');

  }, [value]);

  const handleCountrySelect = (country: Country) => {;
    setSelectedCountry(country);
    setIsOpen(false);
    // Update the parent with the full phone number including new country code
    if (phoneNumber) {
      onChange(`${country.dialCode} ${phoneNumber}`.trim());

  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {;
    const newValue = e.target.value;
    setPhoneNumber(newValue);
    // Only update parent if there's actually a number
    if (newValue) {
      onChange(`${selectedCountry.dialCode} ${newValue}`.trim());
    } else {
      onChange('');

  };

  return (
    <div className={`flex rounded-lg border border-input ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-10 sm:h-12 px-3 border-0 border-r rounded-r-none bg-gray-50 hover:bg-gray-100 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 focus:z-10"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{selectedCountry.flag}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <div className="py-1 max-h-[300px] overflow-y-auto">
            {/* Brazil first */}
            <button
              type="button"
              className={`w-full flex items-center px-4 py-3 text-sm hover:bg-gray-100 ${
                selectedCountry.code === 'BR' ? 'bg-gray-50 font-medium' : ''
              }`}
              onClick={() => handleCountrySelect(countries[0])}
            >
              <span 
                className="w-6 h-6 flex items-center justify-center text-lg"
                role="img"
                aria-label="Brasil"
              >
                {getFlagEmoji('BR')}
              </span>
              <span className="ml-2 flex-1 text-left">Brasil</span>
              <span className="text-gray-500">+55</span>
              {selectedCountry.code === 'BR' && (
                <Check className="ml-2 h-4 w-4 text-blue-500" />
              )}
            </button>
            
            {/* Other countries */}
            {countries
              .filter(country => country.code !== 'BR')
              .map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className={`w-full flex items-center px-4 py-3 text-sm hover:bg-gray-100 ${
                    selectedCountry.code === country.code ? 'bg-gray-50 font-medium' : ''
                  }`}
                  onClick={() => handleCountrySelect(country)}
                >
                  <span 
                    className="w-6 h-6 flex items-center justify-center text-lg"
                    role="img"
                    aria-label={country.name}
                  >
                    {country.flag}
                  </span>
                  <span className="ml-2 flex-1 text-left">{country.name}</span>
                  <span className="text-gray-500">{country.dialCode}</span>
                  {selectedCountry.code === country.code && (
                    <Check className="ml-2 h-4 w-4 text-blue-500" />
                  )}
                </button>
              ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <div className="flex-1 relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm flex items-center gap-1">
          <span 
            className="text-lg w-6 h-6 flex items-center justify-center"
            role="img"
            aria-label={selectedCountry.name}
          >
            {selectedCountry.flag}
          </span>
          <span>{selectedCountry.dialCode}</span>
        </div>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          className="pl-20 h-10 sm:h-12 border-0 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
          required={required}
        />
      </div>
    </div>
  );
};
