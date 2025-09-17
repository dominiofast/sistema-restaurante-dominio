# GitHub Imports BR - Sistema de Gestão Empresarial

## Overview

This project is a comprehensive restaurant and business management system built with React, TypeScript, and Supabase. The system provides features for order management, customer relationship management, inventory control, AI-powered WhatsApp integration, fiscal management, and more. It appears to be specifically tailored for Brazilian businesses, particularly restaurants and food delivery services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Routing**: React Router DOM with code-splitting and lazy loading
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **API**: Supabase Edge Functions for serverless compute
- **Authentication**: Supabase Auth with role-based access control
- **Real-time**: Supabase real-time subscriptions for live updates
- **File Storage**: Supabase Storage for media files and documents

### Database Design
- **Multi-tenancy**: Company-based data isolation using `company_id` foreign keys
- **Security**: Row Level Security policies for data access control
- **Performance**: Optimized queries with proper indexing and RPC functions
- **Organization**: Structured schema with clear separation of concerns (orders, customers, products, fiscal data, etc.)

### AI Integration
- **WhatsApp Bot**: Automated customer service with configurable responses
- **Knowledge Base**: Dynamic product and company information for AI responses
- **Conversation Management**: Chat history and context preservation
- **Pause/Resume**: Manual override capabilities for human intervention

### Print System Integration
- **QZ Tray**: Local printer integration for receipts and kitchen orders
- **Dominio Printer API**: Custom printing solution with auto-discovery
- **Multiple Printer Support**: Kitchen, bar, cashier, and delivery printer configurations

## External Dependencies

### Core Services
- **Supabase**: Primary backend service for database, authentication, storage, and edge functions
- **Cloudinary**: Image and document hosting for product images and PDFs
- **Google Maps API**: Location services and address validation
- **Firecrawl**: Web scraping service for importing menus from iFood and other platforms

### Development Tools
- **Vite**: Build tool and development server
- **ESLint**: Code linting and formatting
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **React Hook Form**: Form handling and validation
- **TanStack React Query**: Server state management
- **DND Kit**: Drag and drop functionality

### Print Integration
- **QZ Tray**: Local printer management software
- **Node.js Scripts**: Printer discovery and management utilities

### Business Integrations
- **iFood API**: Menu import and order synchronization
- **WhatsApp Business API**: Customer communication
- **Payment Gateways**: PIX and credit card processing
- **Fiscal Systems**: Brazilian tax compliance (NFCe, SAT)

### File Organization
The project uses a structured file organization system with dedicated folders for different types of files:
- `database/` - SQL scripts organized by category (cashback, queries, fiscal, etc.)
- `scripts/` - Utility scripts in PowerShell, batch, and Node.js
- `test-files/` - HTML and JavaScript files for testing
- `docs/` - Project documentation
- `api/` - Serverless functions for external integrations