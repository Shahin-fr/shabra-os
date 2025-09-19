// Optimized icon imports to reduce bundle size
// Only import the specific icons we need instead of the entire library
import React from 'react';

// Common icons used throughout the app
export {
  // Navigation
  Home,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  
  // Actions
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  Search,
  Filter,
  Settings,
  MoreHorizontal,
  MoreVertical,
  
  // Status
  Circle,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  
  // Media
  Image,
  File,
  FileText,
  Download,
  Upload,
  
  // Communication
  MessageCircle,
  Mail,
  Phone,
  Users,
  User,
  UserPlus,
  
  // Time
  Clock,
  Calendar,
  CalendarIcon,
  Timer,
  
  // Data
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  
  // UI
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  
  // System
  Wifi,
  WifiOff,
  Battery,
  Signal,
  RefreshCw,
  RotateCcw,
  Power,
  
  // Content
  Palette,
  Type,
  Bold,
  Italic,
  Underline,
  Link,
  ImageIcon,
  Video,
  Music,
  Mic,
  MicOff,
  
  // Layout
  Grid,
  List,
  Layout,
  Sidebar,
  Maximize,
  Minimize,
  
  // Tools
  Wrench,
  Cog,
  Sliders,
  ToggleLeft,
  ToggleRight,
  
  // Business
  Building,
  Briefcase,
  Target,
  Award,
  Trophy,
  Gift,
  
  // Development
  Code,
  Terminal,
  Database,
  Server,
  Cloud,
  Globe,
  
  // Mobile
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  
  // Social
  Share,
  Share2,
  Copy,
  ExternalLink,
  
  // Forms
  CheckSquare,
  Square,
  Radio,
  
  // Navigation specific
  Compass,
  Map,
  MapPin,
  Navigation,
  
  // Content specific
  Book,
  BookOpen,
  FileCode,
  Folder,
  FolderOpen,
  
  // Status specific
  Loader2,
  Loader,
  AlertTriangle,
  CheckCircle2,
  
  // Time specific
  Sun,
  Moon,
  Sunrise,
  Sunset,
  
  // Data specific
  BarChart,
  LineChart,
  ScatterChart,
  
  // UI specific
  Maximize2,
  Minimize2,
  Move,
  MoveHorizontal,
  MoveVertical,
  
  // System specific
  Cpu,
  HardDrive,
  MemoryStick,
  
  // Content specific
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  
  // Layout specific
  Columns,
  Rows,
  
  // Tools specific
  Hammer,
  
  // Business specific
  Building2,
  
  // Development specific
  Code2,
  
  // Mobile specific
  Smartphone as PhoneIcon,
  Tablet as TabletIcon,
  Monitor as Desktop,
  Laptop as LaptopIcon,
  
  // Social specific
  Share as ShareIcon,
  Share2 as ShareAlt,
  Copy as CopyIcon,
  ExternalLink as External,
  
  // Forms specific
  CheckSquare as Checkbox,
  Square as CheckboxEmpty,
  Radio as RadioButton,
  
  // Navigation specific
  Compass as NavigationIcon,
  Map as MapIcon,
  MapPin as Pin,
  Navigation as Nav,
  
  // Content specific
  Book as BookIcon,
  BookOpen as OpenBook,
  FileCode as CodeFile,
  Folder as FolderIcon,
  FolderOpen as OpenFolder,
  
  // Status specific
  Loader2 as Spinner,
  Loader as Loading,
  AlertTriangle as WarningTriangle,
  CheckCircle2 as CheckCircleAlt,
  XCircle as XCircleAlt,
  
  // Time specific
  Sun as SunIcon,
  Moon as MoonIcon,
  Sunrise as SunriseIcon,
  Sunset as SunsetIcon,
  
  // Data specific
  Database as DataIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  ScatterChart as ScatterChartIcon,
  
  // UI specific
  Maximize2 as MaximizeIcon,
  Minimize2 as MinimizeIcon,
  Move as MoveIcon,
  MoveHorizontal as MoveH,
  MoveVertical as MoveV,
  
  // System specific
  Cpu as CpuIcon,
  HardDrive as HardDriveIcon,
  MemoryStick as MemoryIcon,
  Wifi as NetworkIcon,
  
  // Content specific
  AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon,
  AlignJustify as AlignJustifyIcon,
  
  // Layout specific
  Columns as ColumnsIcon,
  Rows as RowsIcon,
  
  // Tools specific
  Hammer as HammerIcon,
  Wrench as ToolWrenchIcon,
  Cog as GearIcon,
  Sliders as SliderIcon,
  
  // Business specific
  Building2 as BuildingIcon,
  Briefcase as WorkIcon,
  Target as GoalIcon,
  Award as AchievementIcon,
  
  // Development specific
  Code2 as CodeIcon,
  Terminal as ConsoleIcon,
  Database as DBIcon,
  Server as ServerIcon,
  
  // Mobile specific
  Smartphone as PhoneIconAlt,
  Tablet as TabletIconAlt,
  Monitor as DesktopIcon,
  Laptop as LaptopIconAlt,
  
  // Social specific
  Share as ShareIconAlt,
  Share2 as ShareAltIcon,
  Copy as CopyIconAlt,
  ExternalLink as ExternalIcon,
  
  // Forms specific
  CheckSquare as CheckboxIcon,
  Square as CheckboxEmptyIcon,
  Radio as RadioButtonIcon,
} from 'lucide-react';

// Create a dynamic icon component for icons that might not be used immediately
export const DynamicIcon = ({ name, ...props }: { name: string; [key: string]: any }) => {
  const IconComponent = require('lucide-react')[name];
  return IconComponent ? React.createElement(IconComponent, props) : null;
};