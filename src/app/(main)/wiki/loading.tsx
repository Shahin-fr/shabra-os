export default function WikiLoading() {
  return (
    <div className='flex h-screen bg-background'>
      {/* Sidebar Loading */}
      <div className='w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='p-4 border-b'>
          <div className='animate-pulse space-y-3'>
            <div className='h-6 bg-muted rounded w-3/4'></div>
            <div className='h-4 bg-muted rounded w-1/2'></div>
          </div>
        </div>
        <div className='p-2'>
          <div className='animate-pulse space-y-3'>
            <div className='h-4 bg-muted rounded w-3/4'></div>
            <div className='h-4 bg-muted rounded w-1/2'></div>
            <div className='h-4 bg-muted rounded w-5/6'></div>
            <div className='h-4 bg-muted rounded w-2/3'></div>
          </div>
        </div>
      </div>

      {/* Main Content Loading */}
      <div className='flex-1 flex flex-col'>
        <div className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
          <div className='flex h-16 items-center justify-between px-6'>
            <div className='animate-pulse space-y-2'>
              <div className='h-6 bg-muted rounded w-48'></div>
              <div className='h-4 bg-muted rounded w-64'></div>
            </div>
            <div className='h-9 bg-muted rounded w-20'></div>
          </div>
        </div>

        <div className='flex-1 flex items-center justify-center'>
          <div className='animate-pulse space-y-4 w-full max-w-4xl px-8'>
            <div className='h-8 bg-muted rounded w-3/4'></div>
            <div className='h-4 bg-muted rounded w-1/2'></div>
            <div className='space-y-2'>
              <div className='h-4 bg-muted rounded'></div>
              <div className='h-4 bg-muted rounded w-5/6'></div>
              <div className='h-4 bg-muted rounded w-4/6'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

