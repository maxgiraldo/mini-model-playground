import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

const LoadingIndicator = () => {
  return (
    <div className="flex items-center justify-start p-6">
      <div className="flex items-center space-x-3 text-gray-500">
        <EllipsisHorizontalIcon className="size-8 animate-pulse" />
      </div>
    </div>
  )
}

export default LoadingIndicator 