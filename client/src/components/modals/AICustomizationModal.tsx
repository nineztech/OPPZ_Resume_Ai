import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Building2, Globe, User, X } from 'lucide-react';
import countryList from 'react-select-country-list';

interface AICustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: { sector: string; country: string; designation: string }) => void;
}

const AICustomizationModal: React.FC<AICustomizationModalProps> = ({
  isOpen,
  onClose,
  onContinue
}) => {
  const [sector, setSector] = useState('');
  const [country, setCountry] = useState('');
  const [designation, setDesignation] = useState('');
  const [countries] = useState(() => countryList().getData());

  if (!isOpen) return null;

  const handleContinue = () => {
    if (sector && country && designation) {
      onContinue({ sector, country, designation });
    }
  };

  const isFormValid = sector && country && designation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Customization</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1">
          <p className="text-sm text-gray-600 mb-6">Tell us about your background.</p>
          
          <div className="space-y-4">
            {/* Sector/Industry */}
            <div>
              <Label htmlFor="sector" className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                Sector/Industry
              </Label>
              <Input
                id="sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="e.g., Technology, Healthcare, Finance"
                className="w-full"
              />
            </div>

            {/* Country */}
            <div>
              <Label htmlFor="country" className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-gray-500" />
                Country
              </Label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select a country</option>
                {countries.map((countryOption: any) => (
                  <option key={countryOption.value} value={countryOption.label}>
                    {countryOption.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation/Role */}
            <div>
              <Label htmlFor="designation" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                Designation/Role
              </Label>
              <Input
                id="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g., Software Engineer, Marketing Manager"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <Button
            onClick={handleContinue}
            disabled={!isFormValid}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Continue with AI
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AICustomizationModal;
