// Admin Dashboard Data Models and Interfaces

// Company Statistics
export interface CompanyStats {
  totalEmployees: number;
  activeProjects: number;
  completedTasks: number;
  attendanceRate: number;
  employeeGrowth: {
    percentage: number;
    period: string;
    isPositive: boolean;
  };
  projectGrowth: {
    percentage: number;
    period: string;
    isPositive: boolean;
  };
  taskGrowth: {
    percentage: number;
    period: string;
    isPositive: boolean;
  };
  attendanceGrowth: {
    percentage: number;
    period: string;
    isPositive: boolean;
  };
}

// Dashboard Widget Props
export interface DashboardWidgetProps {
  className?: string;
  isLoading?: boolean;
  error?: string | null;
}

// Hero Header Props
export interface HeroHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

// Company Stats Widget Props
export interface CompanyStatsWidgetProps extends DashboardWidgetProps {
  stats: CompanyStats;
  onStatClick?: (statType: keyof CompanyStats) => void;
}

// Individual Stat Item
export interface StatItem {
  value: string | number;
  label: string;
  growth: {
    percentage: number;
    period: string;
    isPositive: boolean;
  };
  icon?: string;
  color?: string;
}

// Navigation Card Props
export interface NavigationCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hoverColor: string;
  className?: string;
}

// Dashboard Layout Props
export interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// Animation Variants
export interface AnimationVariants {
  container: {
    hidden: { opacity: number };
    visible: {
      opacity: number;
      transition: {
        staggerChildren: number;
        delayChildren: number;
      };
    };
  };
  item: {
    hidden: { opacity: number; y: number; scale: number };
    visible: {
      opacity: number;
      y: number;
      scale: number;
      transition: {
        duration: number;
      };
    };
  };
  header: {
    hidden: { opacity: number; y: number };
    visible: {
      opacity: number;
      y: number;
      transition: {
        duration: number;
      };
    };
  };
}

// Dashboard State
export interface DashboardState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshInterval: number;
}

// Dashboard Actions
export interface DashboardActions {
  refresh: () => Promise<void>;
  setRefreshInterval: (interval: number) => void;
  clearError: () => void;
}

// Widget Grid Layout
export interface WidgetGridProps {
  children: React.ReactNode;
  columns: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: number;
  className?: string;
}

// Performance Metrics
export interface PerformanceMetrics {
  weeklyPerformance: {
    labels: string[];
    data: number[];
    target: number[];
  };
  taskBottlenecks: {
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    assignedTo: string;
    dueDate: Date;
    progress: number;
  }[];
  keyPerformanceIndicators: {
    id: string;
    name: string;
    value: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
  }[];
}

// Team Activity
export interface TeamActivity {
  id: string;
  type: 'task_completed' | 'project_created' | 'meeting_scheduled' | 'milestone_reached';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Quarterly Goals
export interface QuarterlyGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  progress: number;
}

// Dashboard Data Hook Return Type
export interface DashboardData {
  companyStats: CompanyStats;
  performanceMetrics: PerformanceMetrics;
  teamActivity: TeamActivity[];
  quarterlyGoals: QuarterlyGoal[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Widget Error State
export interface WidgetErrorState {
  hasError: boolean;
  error: string | null;
  retry: () => void;
}

// Widget Loading State
export interface WidgetLoadingState {
  isLoading: boolean;
  loadingText?: string;
}

// Dashboard Configuration
export interface DashboardConfig {
  refreshInterval: number;
  enableAnimations: boolean;
  enableAutoRefresh: boolean;
  defaultWidgets: string[];
  layout: 'grid' | 'list' | 'custom';
}

// Widget Metadata
export interface WidgetMetadata {
  id: string;
  title: string;
  description: string;
  category: 'analytics' | 'overview' | 'activity' | 'performance' | 'navigation';
  size: 'small' | 'medium' | 'large' | 'full';
  position: {
    row: number;
    column: number;
    span: number;
  };
  isVisible: boolean;
  isCollapsible: boolean;
  isResizable: boolean;
}
