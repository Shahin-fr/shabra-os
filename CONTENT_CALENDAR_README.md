# Content Calendar & Jalali Calendar System

## Overview

This document describes the major overhaul of the Storyboard and content planning system, including the implementation of a Jalali (Persian) calendar and a new content calendar view.

## Features Implemented

### Part 1: Jalali Calendar Component

#### ✅ **Fully Jalali Calendar**
- **Persian Month Names**: فروردین, اردیبهشت, خرداد, تیر, مرداد, شهریور, مهر, آبان, آذر, دی, بهمن, اسفند
- **Persian Day Names**: یکشنبه, دوشنبه, سه‌شنبه, چهارشنبه, پنج‌شنبه, جمعه, شنبه
- **Persian Day Short Names**: ی, د, س, چ, پ, ج, ش
- **Jalali Date Formatting**: All dates displayed in Persian calendar format

#### ✅ **Enhanced UI/UX**
- **Brand Colors**: Uses Shabra's signature pink accent colors (#ff0a54)
- **Modern Design**: Clean, glassmorphism design with backdrop blur effects
- **Responsive Layout**: Optimized for both desktop and mobile devices
- **Hover Effects**: Smooth transitions and hover states for better interactivity

#### ✅ **Full Functionality**
- **Date Selection**: Clicking any day correctly loads story slots for that specific date
- **Month Navigation**: Easy navigation between months with intuitive controls
- **Today Highlighting**: Current date is highlighted with accent colors
- **Selected Date**: Selected date is prominently displayed with brand colors

### Part 2: Content Calendar View

#### ✅ **New Page: `/content-calendar`**
- **Dedicated Route**: Fully functional content planning page
- **Navigation Integration**: Added to main sidebar navigation

#### ✅ **Weekly Kanban Board**
- **7-Day Layout**: Each column represents a day of the week (شنبه to جمعه)
- **Persian Day Names**: Full Persian day names with Jalali dates
- **Week Navigation**: Navigate between weeks with previous/next controls
- **Current Week**: Quick jump to current week functionality

#### ✅ **Content Cards System**
- **Title Field**: Descriptive titles for content (e.g., "سرویس هرمس 2035")
- **Type Selector**: Choose between Story or Post content types
- **Status Management**: Track content through Idea → In Progress → Ready → Published
- **Notes Support**: Additional notes and descriptions for each content item
- **Project Linking**: Optional project association for better organization

#### ✅ **Database Integration**
- **New Prisma Model**: `ContentSlot` with all required fields
- **Full CRUD Operations**: Create, Read, Update, Delete content slots
- **API Endpoints**: RESTful API for content slot management
- **Data Persistence**: All operations work with PostgreSQL database

#### ✅ **Drag & Drop Functionality**
- **Cross-Day Movement**: Move content between different days of the week
- **Real-time Updates**: Immediate database updates on drag and drop
- **Visual Feedback**: Smooth animations and visual cues during operations
- **Order Management**: Automatic ordering within each day column

## Technical Implementation

### Dependencies Added
```json
{
  "moment-jalaali": "^0.10.0",
  "@types/moment": "^2.13.0"
}
```

### New Components
1. **`JalaliCalendar`** - Custom Jalali calendar component
2. **`ContentCalendarPage`** - Main content calendar page
3. **`ContentCard`** - Individual content item display
4. **`ContentForm`** - Create/edit content form

### New API Endpoints
- `GET /api/content-slots` - Fetch content slots for a week
- `POST /api/content-slots` - Create new content slot
- `GET /api/content-slots/[id]` - Get specific content slot
- `PATCH /api/content-slots/[id]` - Update content slot
- `DELETE /api/content-slots/[id]` - Delete content slot

### Database Schema
```prisma
enum ContentType {
  STORY @map("story")
  POST  @map("post")
}

enum ContentStatus {
  IDEA        @map("idea")
  IN_PROGRESS @map("in_progress")
  READY       @map("ready")
  PUBLISHED   @map("published")
}

model ContentSlot {
  id          String        @id @default(cuid())
  title       String
  type        ContentType   @default(STORY)
  status      ContentStatus @default(IDEA)
  dayOfWeek   Int           // 0 = Saturday, 1 = Sunday, etc.
  weekStart   DateTime      // Start of the week (Saturday)
  order       Int           @default(0)
  notes       String?
  projectId   String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relations
  project Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)

  @@map("content_slots")
}
```

## Usage Instructions

### Jalali Calendar
1. **Navigate to Storyboard**: Go to `/storyboard` page
2. **Date Selection**: Click the date picker button
3. **Calendar Navigation**: Use left/right arrows to navigate months
4. **Date Selection**: Click any date to select it and load stories

### Content Calendar
1. **Access Page**: Navigate to `/content-calendar` from sidebar
2. **Create Content**: Click "محتوای جدید" button
3. **Fill Form**: Enter title, type, status, day, and notes
4. **Drag & Drop**: Move content between days by dragging cards
5. **Edit/Delete**: Hover over cards to see edit/delete options

## Design Features

### Color Scheme
- **Primary**: #ff0a54 (Shabra Pink)
- **Background**: Glassmorphism with backdrop blur
- **Borders**: Subtle white/transparent borders
- **Shadows**: Multi-layered shadows for depth

### Typography
- **Font**: Vazirmatn (Persian-optimized)
- **Hierarchy**: Clear heading and text hierarchy
- **RTL Support**: Full right-to-left text support

### Animations
- **Framer Motion**: Smooth page transitions
- **Hover Effects**: Interactive hover states
- **Drag Feedback**: Visual feedback during drag operations

## Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile**: Responsive design for all screen sizes
- **RTL Support**: Full right-to-left language support

## Performance Optimizations

- **React Query**: Efficient data fetching and caching
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Lazy Loading**: Components load only when needed
- **Efficient Rendering**: Minimal re-renders with proper state management

## Future Enhancements

### Planned Features
- **Content Templates**: Pre-defined content templates
- **Bulk Operations**: Multi-select and bulk actions
- **Export/Import**: CSV/Excel export functionality
- **Advanced Filtering**: Filter by type, status, project
- **Calendar Views**: Monthly and yearly calendar views
- **Notifications**: Content deadline reminders

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live updates
- **Offline Support**: Service worker for offline functionality
- **Advanced Search**: Full-text search across content
- **Analytics**: Content performance tracking

## Troubleshooting

### Common Issues
1. **Calendar Not Loading**: Check if moment-jalaali is properly installed
2. **TypeScript Errors**: Ensure type declarations are in place
3. **Database Errors**: Verify Prisma schema and migrations
4. **Styling Issues**: Check Tailwind CSS configuration

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify API endpoints are responding correctly
3. Check database connection and schema
4. Validate component props and state

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Last Updated**: August 21, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
