import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationDropdown } from '@/components/navigation/NavigationDropdown';
import FacebookPixelInjector from '@/components/marketing/FacebookPixelInjector';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Dropdown Header */}
      <NavigationDropdown />
      
      <FacebookPixelInjector />
      {/* Page Content */}
      <div className="pt-16">
        <Outlet />
      </div>
    </div>;
  );
};

export default AppLayout;