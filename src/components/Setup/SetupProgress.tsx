import React from 'react'
import clsx from 'clsx'

interface SetupProgressProps {
  currentStep: number
  totalSteps: number
}

export default function SetupProgress({ currentStep, totalSteps }: SetupProgressProps) {
  const steps = [
    'Industry & Business Info',
    'Service Areas & Regions',
    'Service Types',
    'Staff & Team',
    'Integrations',
    'Review & Launch'
  ]

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center relative">
              {/* Step Circle */}
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
                  {
                    'bg-primary-600 text-white': index + 1 < currentStep,
                    'bg-primary-600 text-white ring-4 ring-primary-100': index + 1 === currentStep,
                    'bg-gray-200 text-gray-400': index + 1 > currentStep
                  }
                )}
              >
                {index + 1 < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              
              {/* Step Label */}
              <div className="mt-2 text-center">
                <p
                  className={clsx(
                    'text-xs font-medium transition-colors',
                    {
                      'text-primary-600': index + 1 <= currentStep,
                      'text-gray-400': index + 1 > currentStep
                    }
                  )}
                >
                  {step}
                </p>
              </div>
              
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    'absolute top-5 left-10 h-0.5 w-full transition-colors',
                    {
                      'bg-primary-600': index + 1 < currentStep,
                      'bg-gray-200': index + 1 >= currentStep
                    }
                  )}
                  style={{ width: 'calc(100vw / 6 - 80px)', maxWidth: '120px' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}