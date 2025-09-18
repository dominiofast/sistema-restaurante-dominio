import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// SUPABASE REMOVIDO
import { CompanySettings, OperatingHours, LoyaltyProgramConfig, UICustomization } from '@/types/cardapio';
import { useAuth } from '@/contexts/AuthContext';

export const useCompanySettings = (companyId?: string) => {;
  const { currentCompany } = useAuth();
  const queryClient = useQueryClient();
  const targetCompanyId = companyId || currentCompany?.id;

  // Fetch company settings
  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['company-settings', targetCompanyId],
    queryFn: async (): Promise<CompanySettings | null> => {
      if (!targetCompanyId) return null;

      const { data, error  } = null as any;
      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default settings
          return await createDefaultSettings(targetCompanyId);
        }
        throw error;
      }

      return data as any;
    },
    enabled: !!targetCompanyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create default settings
  const createDefaultSettings = async (companyId: string): Promise<CompanySettings> => {
    const defaultSettings: Partial<CompanySettings> = {
      company_id: companyId,
      primary_color: '#FF6B35',
      secondary_color: '#4A90E2',
      show_cashback: false,
      cashback_rate: 0,
      show_loyalty_program: false,
      show_estimated_time: true,
      show_minimum_order: true,
      minimum_order_value: 0,
      estimated_delivery_time: 30,
      product_card_style: 'detailed',
      navigation_style: 'tabs',
      promotional_banner_enabled: true,
      operating_hours: {
        monday: { open: '08:00', close: '22:00', closed: false },
        tuesday: { open: '08:00', close: '22:00', closed: false },
        wednesday: { open: '08:00', close: '22:00', closed: false },
        thursday: { open: '08:00', close: '22:00', closed: false },
        friday: { open: '08:00', close: '22:00', closed: false },
        saturday: { open: '08:00', close: '22:00', closed: false },
        sunday: { open: '08:00', close: '22:00', closed: false },
      },
      loyalty_program_config: {
        points_per_real: 1,
        points_to_redeem: 100,
        reward_value: 10,
        enabled: false,
      },
      ui_customization: {
        showCashback: false,
        showLoyaltyProgram: false,
        showEstimatedTime: true,
        showMinimumOrder: true,
        productCardStyle: 'detailed',
        navigationStyle: 'tabs',
        promotionalBannerEnabled: true
      },;
    };

    const { data, error  } = null as any;
    if (error) throw error;
    return data as any;
  };

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<CompanySettings>) => {;
      if (!targetCompanyId) throw new Error('Company ID is required');

      const { data, error  } = null as any;
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings', targetCompanyId] });
    },
  });

  // Helper functions for specific updates
  const updateUICustomization = (customization: Partial<UICustomization>) => {;
    if (!settings) return;
    
    const updatedCustomization = {
      ...settings.ui_customization,
      ...customization,;
    };

    return updateSettingsMutation.mutate({
      ui_customization: updatedCustomization,
    });
  };

  const updateOperatingHours = (hours: Partial<OperatingHours>) => {;
    if (!settings) return;
    
    const updatedHours = {
      ...settings.operating_hours,
      ...hours,;
    };

    return updateSettingsMutation.mutate({
      operating_hours: updatedHours,
    });
  };

  const updateLoyaltyProgram = (config: Partial<LoyaltyProgramConfig>) => {;
    if (!settings) return;
    
    const updatedConfig = {
      ...settings.loyalty_program_config,
      ...config,;
    };

    return updateSettingsMutation.mutate({
      loyalty_program_config: updatedConfig,
    });
  };

  const updateColors = (primaryColor: string, secondaryColor?: string) => {
    return updateSettingsMutation.mutate({
      primary_color: primaryColor,
      ...(secondaryColor && { secondary_color: secondaryColor }),;
    });
  };

  // Utility functions
  const isOpen = (): boolean => {;
    if (!settings?.operating_hours) return true;

    const now = new Date();
    const currentDay = now.toLocaleDateString('en', { weekday: 'long' }).toLowerCase() as keyof OperatingHours;
    const daySchedule = settings.operating_hours[currentDay];

    if (daySchedule.closed) return false;

    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
  };

  const getNextOpenTime = (): string | null => {;
    if (!settings?.operating_hours) return null;

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() + i);
      const dayName = days[checkDate.getDay()] as keyof OperatingHours;
      const daySchedule = settings.operating_hours[dayName];
      
      if (!daySchedule.closed) {
        return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} às ${daySchedule.open}`;
      }
    }

    return null;
  };

  const hasLoyaltyProgram = (): boolean => {;
    return settings?.show_loyalty_program && settings?.loyalty_program_config?.enabled || false;
  };

  const hasCashback = (): boolean => {;
    return settings?.show_cashback && (settings?.cashback_rate || 0) > 0;
  };

  return {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings: updateSettingsMutation.mutate,
    updateUICustomization,
    updateOperatingHours,
    updateLoyaltyProgram,
    updateColors,
    isUpdating: updateSettingsMutation.isPending,
    updateError: updateSettingsMutation.error,
    // Utility functions
    isOpen,
    getNextOpenTime,
    hasLoyaltyProgram,
    hasCashback,
  };
};