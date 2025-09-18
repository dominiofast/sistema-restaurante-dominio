
export interface Categoria {
  id: string;
  name: string;
  description?: string;
  image?: string;
  order_position: number;
  is_active: boolean;
  company_id: string;
  tipo_fiscal_id?: string;
  created_at?: string;
  updated_at?: string;


export interface Produto {
  id: string;
  name: string;
  description?: string;
  price: number;
  promotional_price?: number;
  is_promotional?: boolean;
  image?: string;
  images?: string[];
  categoria_id?: string;
  is_available: boolean;
  preparation_time?: number;
  ingredients?: string;
  destaque?: boolean;
  order_position?: number;
  company_id: string;
  tipo_fiscal_id?: string;
  created_at?: string;
  updated_at?: string;


export interface CategoriaAdicional {
  id: string;
  name: string;
  description?: string;
  selection_type: 'single' | 'multiple' | 'quantity';
  is_required: boolean;
  min_selection?: number;
  max_selection?: number;
  order_position?: number;
  company_id: string;
  created_at?: string;
  updated_at?: string;


export interface Adicional {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoria_adicional_id: string;
  is_available: boolean;
  is_active: boolean;
  order_position?: number;
  created_at?: string;
  updated_at?: string;


export interface ProdutoCategoriaAdicional {
  id: string;
  produto_id: string;
  categoria_adicional_id: string;
  is_required: boolean;
  min_selection?: number;
  max_selection?: number;
  created_at?: string;


export interface DashboardStats {
  totalCategorias: number;
  totalProdutos: number;
  produtosAtivos: number;
  categoriasAtivas: number;


// Enhanced UI Customization Types
export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;


export interface DaySchedule {
  open: string; // Format: "HH:MM"
  close: string; // Format: "HH:MM"
  closed: boolean;


export interface LoyaltyProgramConfig {
  points_per_real: number;
  points_to_redeem: number;
  reward_value: number;
  enabled: boolean;


export interface UICustomization {
  showCashback: boolean;
  showLoyaltyProgram: boolean;
  showEstimatedTime: boolean;
  showMinimumOrder: boolean;
  productCardStyle: 'compact' | 'detailed';
  navigationStyle: 'tabs' | 'dropdown';
  promotionalBannerEnabled: boolean;
  [key: string]: any; // For additional custom properties


export interface CompanySettings {
  id: string;
  company_id: string;
  // Printer settings (existing)
  printer_ip?: string;
  printer_port?: number;
  printer_name?: string;
  printer_type?: 'network' | 'dominio' | 'qz_tray';
  dominio_printer_name?: string;
  printnode_child_account_id?: number;
  printnode_child_email?: string;
  printnode_default_printer_id?: number;
  printnode_default_printer_name?: string;
  printnode_enabled?: boolean;
  // UI Customization (new)
  primary_color: string;
  secondary_color?: string;
  show_cashback: boolean;
  cashback_rate: number;
  show_loyalty_program: boolean;
  show_estimated_time: boolean;
  show_minimum_order: boolean;
  minimum_order_value: number;
  estimated_delivery_time: number;
  product_card_style: 'compact' | 'detailed';
  navigation_style: 'tabs' | 'dropdown';
  promotional_banner_enabled: boolean;
  operating_hours: OperatingHours;
  loyalty_program_config: LoyaltyProgramConfig;
  ui_customization: UICustomization;
  created_at?: string;
  updated_at?: string;


export interface ProductBadge {
  type: 'promotion' | 'new' | 'popular' | 'cashback' | 'featured';
  label: string;
  color: string;
  priority: number;


export interface EnhancedProduct extends Produto {
  badges?: ProductBadge[];
  nutritionalInfo?: NutritionalInfo;
  allergens?: string[];
  customizations?: ProductCustomization[];
  relatedProducts?: string[];


export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;


export interface ProductCustomization {
  id: string;
  name: string;
  type: 'size' | 'ingredient' | 'preparation';
  options: CustomizationOption[];
  required: boolean;
  max_selections?: number;


export interface CustomizationOption {
  id: string;
  name: string;
  price_modifier: number;
  available: boolean;

