'use client'

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Model } from '../hooks/useModels'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface ModelSelectorProps {
  models: Model[]
  selectedModel: Model | null
  setSelectedModel: (model: Model) => void
  isLoading: boolean
  error: Error | null
}

export default function ModelSelector({
  models,
  selectedModel,
  setSelectedModel,
  isLoading,
  error,
}: ModelSelectorProps) {
  return (
    <Listbox value={selectedModel} onChange={setSelectedModel} disabled={isLoading || !!error}>
      <div className="relative">
        <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500">
          <span className="block truncate">
            {isLoading
              ? 'Loading models...'
              : error
                ? 'Error loading models'
                : selectedModel
                  ? selectedModel.title
                  : 'Select a model'}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>
        <ListboxOptions className="absolute z-10 bottom-full mb-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {models.map((model) => (
            <ListboxOption
              key={model.name}
              className={({ active }) =>
                classNames(
                  active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                  'relative cursor-default select-none py-2 pl-3 pr-9'
                )
              }
              value={model}
            >
              {({ selected, active }) => (
                <>
                  <span
                    className={classNames(
                      selected ? 'font-semibold' : 'font-normal',
                      'block truncate text-left'
                    )}
                  >
                    {model.title}
                  </span>
                  {selected ? (
                    <span
                      className={classNames(
                        active ? 'text-white' : 'text-indigo-600',
                        'absolute inset-y-0 right-0 flex items-center pr-4'
                      )}
                    >
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
} 