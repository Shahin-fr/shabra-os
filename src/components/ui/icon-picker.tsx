'use client';

import React, { useState } from 'react';

import { Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DynamicLucideIcon } from '@/components/ui/DynamicLucideIcon';
import { Input } from '@/components/ui/input';

interface IconPickerProps {
  value: string;
  onValueChange: (_value: string) => void;
  trigger?: React.ReactNode;
}

const icons = [
  'Palette',
  'Lightbulb',
  'Heart',
  'Star',
  'Camera',
  'Video',
  'Music',
  'Mic',
  'Book',
  'Pen',
  'Pencil',
  'Brush',
  'Scissors',
  'Wand',
  'Sparkles',
  'Gift',
  'Cake',
  'Coffee',
  'Pizza',
  'ShoppingBag',
  'CreditCard',
  'DollarSign',
  'TrendingUp',
  'BarChart',
  'PieChart',
  'Activity',
  'Target',
  'Award',
  'Trophy',
  'Medal',
  'Users',
  'User',
  'UserPlus',
  'UserCheck',
  'Smile',
  'Laugh',
  'Frown',
  'Meh',
  'MessageCircle',
  'MessageSquare',
  'Phone',
  'Mail',
  'Send',
  'Share',
  'Download',
  'Upload',
  'Link',
  'ExternalLink',
  'Copy',
  'Edit',
  'Trash',
  'Save',
  'Plus',
  'Minus',
  'X',
  'Check',
  'AlertCircle',
  'Info',
  'HelpCircle',
  'Shield',
  'Lock',
  'Unlock',
  'Eye',
  'EyeOff',
  'Settings',
  'Cog',
  'Wrench',
  'Tool',
  'Hammer',
  'Home',
  'Building',
  'MapPin',
  'Globe',
  'Compass',
  'Navigation',
  'Flag',
  'Map',
  'Calendar',
  'Clock',
  'Timer',
  'Stopwatch',
  'Sun',
  'Moon',
  'Cloud',
  'CloudRain',
  'Zap',
  'Flame',
  'Snowflake',
  'Wind',
  'Droplet',
  'Thermometer',
  'Umbrella',
  'Car',
  'Truck',
  'Bike',
  'Plane',
  'Train',
  'Ship',
  'Rocket',
  'Bus',
  'Gamepad',
  'Dice',
  'Puzzle',
  'Chess',
  'Cards',
  'Dice1',
  'Dice2',
  'Dice3',
  'Dice4',
  'Dice5',
  'Dice6',
  'Play',
  'Pause',
  'Stop',
  'SkipBack',
  'SkipForward',
  'Volume2',
  'VolumeX',
  'Headphones',
  'Radio',
  'Tv',
  'Monitor',
  'Laptop',
  'Smartphone',
  'Tablet',
  'Watch',
  'Mouse',
  'Keyboard',
  'Printer',
  'Scanner',
  'HardDrive',
  'Database',
  'Server',
  'Wifi',
  'Bluetooth',
  'Battery',
  'Plug',
  'Power',
  'Cpu',
  'MemoryStick',
  'Folder',
  'File',
  'FileText',
  'FileImage',
  'FileVideo',
  'FileAudio',
  'Archive',
  'Package',
  'Box',
  'Layers',
  'Grid',
  'List',
  'Layout',
  'Sidebar',
  'Menu',
  'MoreHorizontal',
  'MoreVertical',
  'Ellipsis',
  'ChevronUp',
  'ChevronDown',
  'ChevronLeft',
  'ChevronRight',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Move',
  'RotateCw',
  'RotateCcw',
  'RefreshCw',
  'RefreshCcw',
  'Repeat',
  'Shuffle',
  'Maximize',
  'Minimize',
  'Maximize2',
  'Minimize2',
  'Expand',
  'Compress',
  'ZoomIn',
  'ZoomOut',
  'Search',
  'Filter',
  'SortAsc',
  'SortDesc',
  'ArrowUpDown',
  'ArrowUpAZ',
  'ArrowDownAZ',
  'ArrowUp01',
  'ArrowDown01',
  'Hash',
  'Asterisk',
  'Percent',
  'Equal',
  'NotEqual',
  'LessThan',
  'GreaterThan',
  'PlusCircle',
  'MinusCircle',
  'XCircle',
  'CheckCircle',
  'AlertTriangle',
  'AlertOctagon',
  'QuestionMarkCircle',
  'Ban',
  'XOctagon',
  'ShieldCheck',
  'ShieldAlert',
  'ShieldX',
  'Key',
  'Fingerprint',
  'Glasses',
  'Sunrise',
  'Sunset',
  'CloudSnow',
  'CloudLightning',
  'CloudDrizzle',
  'CloudHail',
  'CloudFog',
  'Tornado',
  'Hurricane',
  'ThermometerSun',
  'ThermometerSnow',
  'Droplets',
  'UmbrellaOff',
  'Rainbow',
  'Bolt',
  'StarOff',
  'HeartOff',
  'ThumbsUp',
  'ThumbsDown',
  'Angry',
  'Sad',
  'Wink',
  'Tongue',
  'Kiss',
];

export function IconPicker({ value, onValueChange, trigger }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = icons.filter(icon =>
    icon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant='outline' className='w-full justify-start'>
            <DynamicLucideIcon iconName={value} className='h-4 w-4 mr-2' />
            انتخاب آیکون
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh]'>
        <DialogHeader>
          <DialogTitle>انتخاب آیکون</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='relative'>
            <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='جستجو در آیکون‌ها...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pr-10'
            />
          </div>

          <div className='grid grid-cols-8 gap-2 max-h-96 overflow-y-auto'>
            {filteredIcons.map(icon => (
              <Button
                key={icon}
                variant={value === icon ? 'default' : 'outline'}
                size='sm'
                className='h-12 w-12 p-0 flex items-center justify-center'
                onClick={() => {
                  onValueChange(icon);
                  setIsOpen(false);
                }}
              >
                <DynamicLucideIcon iconName={icon} className='h-5 w-5' />
                {value === icon && (
                  <Check className='absolute top-1 right-1 h-3 w-3 text-white' />
                )}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

