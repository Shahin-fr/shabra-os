# Story Type UI Testing Guide

The "افزودن" (Add) button has been fixed and now includes full functionality for creating, updating, and deleting story types.

## What Was Fixed

✅ **Create/Update/Delete Mutations**: Implemented all CRUD operations using TanStack Query
✅ **Form Validation**: Added proper validation with error display
✅ **Loading States**: Added loading indicators for all operations
✅ **Error Handling**: Proper error messages for failed operations
✅ **Cache Management**: Automatic cache invalidation and refresh after mutations

## Testing Steps

### 1. Access the Management Interface

1. **Open your browser** and go to `http://localhost:3004`
2. **Login as admin user**:
   - Email: `admin@shabra.com`
   - Password: `password123`
3. **Navigate to Storyboard page**
4. **Click "مدیریت قالب‌ها"** button (top-right of Template Palette section)

### 2. Test Create Functionality

1. **Click "افزودن نوع جدید"** button
2. **Enter a name** (e.g., "اخبار ورزشی")
3. **Click "افزودن"** button
4. **Verify**:
   - Loading spinner appears during submission
   - New story type appears in the list
   - Form resets after successful creation
   - Counter shows "1 استوری" (or current count)

### 3. Test Update Functionality

1. **Click the Edit icon** (pencil) on any existing story type
2. **Modify the name** in the form
3. **Click "بروزرسانی"** button
4. **Verify**:
   - Loading spinner appears
   - Story type name updates in the list
   - Form resets to add mode

### 4. Test Delete Functionality

1. **Click the Delete icon** (trash) on any story type
2. **Confirm deletion** in the dialog
3. **Verify**:
   - Confirmation dialog appears in Persian
   - Loading spinner appears on delete button
   - Story type is removed from the list

### 5. Test Validation

1. **Try to submit empty form**
2. **Verify**: Error message appears: "نام نوع استوری الزامی است"
3. **Start typing** in the name field
4. **Verify**: Error message disappears

### 6. Test Duplicate Names

1. **Create a story type** with a name
2. **Try to create another** with the same name
3. **Verify**: Error message about duplicate names appears

## Expected Behavior

### Success Cases:

- ✅ Create new story types with unique names
- ✅ Edit existing story types
- ✅ Delete story types (with confirmation)
- ✅ Form validation and error clearing
- ✅ Real-time list updates
- ✅ Loading states during operations

### Error Cases:

- ❌ Empty name submission shows validation error
- ❌ Duplicate names show conflict error
- ❌ Delete confirmation prevents accidental deletion
- ❌ Network errors show appropriate messages

## API Endpoints Being Used

- **GET** `/api/story-types` - Fetch all story types
- **POST** `/api/story-types` - Create new story type
- **PUT** `/api/story-types/[id]` - Update story type
- **DELETE** `/api/story-types/[id]` - Delete story type

## Next Features to Implement

1. **Toast Notifications**: Success/error messages
2. **Enhanced Icon System**: Better icon selection
3. **Bulk Operations**: Select multiple for deletion
4. **Search/Filter**: Find story types quickly
5. **Usage Analytics**: Show which story types are most used

## Troubleshooting

If the button still doesn't work:

1. Check browser console for JavaScript errors
2. Verify you're logged in as admin user
3. Check network tab for API call status
4. Refresh the page and try again

The component is now fully functional with proper error handling and user feedback!
