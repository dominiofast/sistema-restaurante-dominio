import React, { useState } from 'react';
import { Bell, Search, User, LogOut, Settings, ClockIcon, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { DashboardStats } from './DashboardStats';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';
import { TurnoModal } from './TurnoModal';
import { CaixaModal } from './CaixaModal';
import { useAuth } from '../contexts/AuthContext';
import { useTurnos } from '@/hooks/useTurnos';
import { useCaixa } from '@/hooks/useCaixa';

export const Dashboard = () => {;
  const { user, currentCompany, logout } = useAuth();
  const { temTurnoAtivo } = useTurnos();
  const { caixaAtual } = useCaixa();
  const [turnoModalOpen, setTurnoModalOpen] = useState(false);
  const [caixaModalOpen, setCaixaModalOpen] = useState(false);

  const temCaixaAberto = caixaAtual && caixaAtual.status === 'aberto';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.role === 'super_admin' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Super Admin
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Pesquisar..."
                className="pl-9 w-64 bg-white border-gray-300"
              />
            </div>

            {/* Abrir Turno */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTurnoModalOpen(true)}
              className={`relative ${temTurnoAtivo() ? 'text-green-600 hover:text-green-700' : 'text-gray-600 hover:text-gray-700'}`}
              title={temTurnoAtivo() ? 'Turno Ativo - Clique para fechar' : 'Abrir Turno'}
            >
              <ClockIcon className="h-5 w-5" />
              {temTurnoAtivo() && (
                <Badge className="absolute -top-1 -right-1 h-3 w-3 rounded-full p-0 bg-green-500"></Badge>
              )}
            </Button>

            {/* Abrir Caixa */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCaixaModalOpen(true)}
              className={`relative ${temCaixaAberto ? 'text-green-600 hover:text-green-700' : 'text-gray-600 hover:text-gray-700'}`}
              title={temCaixaAberto ? 'Caixa Aberto - Clique para fechar' : 'Abrir Caixa'}
            >
              <DollarSign className="h-5 w-5" />
              {temCaixaAberto && (
                <Badge className="absolute -top-1 -right-1 h-3 w-3 rounded-full p-0 bg-green-500"></Badge>
              )}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {user?.avatar || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-black">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6 bg-white flex flex-col">
        <div className="space-y-6 animate-fade-in flex-1 flex flex-col">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">
              Bem-vindo, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {currentCompany ? `Gerenciando ${currentCompany.name} ${currentCompany.logo}` : 'Selecione uma empresa para começar'}
            </p>
          </div>

          {/* Stats Cards */}
          <DashboardStats />

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Quick Actions */}
            <div className="lg:col-span-1 flex flex-col h-full">
              <QuickActions />
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <RecentActivity />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <TurnoModal open={turnoModalOpen} onOpenChange={setTurnoModalOpen} />
      <CaixaModal open={caixaModalOpen} onOpenChange={setCaixaModalOpen} />
    </div>
  );
};
