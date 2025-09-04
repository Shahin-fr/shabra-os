export default function Loading() {
  return (
    <div className='flex items-center justify-center bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30'>
      <div className='text-center space-y-4'>
        <div className='w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto'></div>
        <p className='text-gray-600 font-medium'>در حال بارگذاری...</p>
      </div>
    </div>
  );
}
