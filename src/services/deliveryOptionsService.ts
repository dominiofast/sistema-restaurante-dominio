// SUPABASE REMOVIDO
export interface DeliveryOptions {
  delivery: boolean;
  pickup: boolean;
  eat_in: boolean;
}

export interface DeliveryOptionsService {
  getDeliveryOptions(companyId: string): Promise<DeliveryOptions>;
  validateDeliveryOptions(options: DeliveryOptions): boolean;
}

class DeliveryOptionsServiceImpl implements DeliveryOptionsService {
  private cache = new Map<string, { data: DeliveryOptions; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  async getDeliveryOptions(companyId: string): Promise<DeliveryOptions> {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    // Verificar cache
    const cached = this.cache.get(companyId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'delivery_methods')
        /* .select\( REMOVIDO */ ; //'delivery, pickup, eat_in')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .single\( REMOVIDO */ ; //);

      if (error) {
        if (error.code === 'PGRST116') {
          // Não encontrou registro, usar valores padrão
          const defaultOptions: DeliveryOptions = {
            delivery: false,
            pickup: true,
            eat_in: false
          };
          
          this.cache.set(companyId, {
            data: defaultOptions,
            timestamp: Date.now()
          });
          
          return defaultOptions;
        }
        throw error;
      }

      const options: DeliveryOptions = {
        delivery: !!data.delivery,
        pickup: !!data.pickup,
        eat_in: !!data.eat_in
      };

      if (!this.validateDeliveryOptions(options)) {
        console.warn(`Company ${companyId} has no delivery options enabled`);
      }

      this.cache.set(companyId, {
        data: options,
        timestamp: Date.now()
      });

      return options;
    } catch (error) {
      console.error('Error fetching delivery options:', error);
      
      const fallbackOptions: DeliveryOptions = {
        delivery: false,
        pickup: true,
        eat_in: false
      };
      
      return fallbackOptions;
    }
  }

  validateDeliveryOptions(options: DeliveryOptions): boolean {
    return options.delivery || options.pickup || options.eat_in;
  }

  invalidateCache(companyId: string): void {
    this.cache/* .delete\( REMOVIDO */ ; //companyId);
  }

  clearCache(): void {
    this.cache.clear();
  }

  async forceRefresh(companyId: string): Promise<DeliveryOptions> {
    this.invalidateCache(companyId);
    return this.getDeliveryOptions(companyId);
  }
}

export const deliveryOptionsService = new DeliveryOptionsServiceImpl();