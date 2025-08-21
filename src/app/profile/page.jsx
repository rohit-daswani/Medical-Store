'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    shopName: '',
    address: '',
    gstin: '',
    contactNumber: '',
    email: '',
    ownerName: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      // Set default values
      setProfile(prev => ({
        ...prev,
        email: localStorage.getItem('userEmail') || '',
        ownerName: localStorage.getItem('userName') || ''
      }));
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      toast.success('Profile updated successfully!');
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--brand-blue)]">My Profile</h1>
        <p className="text-[var(--foreground)]/70 mt-1">Manage your medical store information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                value={profile.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                placeholder="Enter owner name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                type="tel"
                value={profile.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                placeholder="Enter contact number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Medical Shop Name</Label>
              <Input
                id="shopName"
                value={profile.shopName}
                onChange={(e) => handleInputChange('shopName', e.target.value)}
                placeholder="Enter shop name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN Number</Label>
              <Input
                id="gstin"
                value={profile.gstin}
                onChange={(e) => handleInputChange('gstin', e.target.value)}
                placeholder="Enter GSTIN number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Shop Address</Label>
              <Textarea
                id="address"
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete shop address"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="px-8"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
