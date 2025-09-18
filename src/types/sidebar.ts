
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  href?: string;
  badge?: string | number | null;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  showForLojista?: boolean;
  isMenuManager?: boolean;
  openInNewTab?: boolean;
  subItems?: MenuItem[];
  badgeType?: 'default' | 'success' | 'warning' | 'error';


export interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;

