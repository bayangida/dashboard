export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-lg">Loading produce...</span>
        </div>
      </div>
    </div>
  )
}
