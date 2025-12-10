import React from 'react'
import clsx from 'clsx'

interface BookingProgressProps {
  currentStep: number
  totalSteps: number
  onStepClick?: (step: number) => void
}

export default function BookingProgress({ 
  currentStep, 
  totalSteps, 
  onStepClick 
}: BookingProgressProps) {
  const steps = [
    { id: 1, name: 'Service', description: 'Choose your service' },
    { id: 2, name: 'Location', description: 'Enter your address' },
    { id: 3, name: 'Date & Time', description: 'Pick your slot' },
    { id: 4, name: 'Details', description: 'Your information' },
    { id: 5, name: 'Confirm', description: 'Review & book' }
  ]

  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div
                onClick={() => onStepClick?.(step.id)}
                className={clsx(
                  'flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold transition-all duration-300',
                  {
                    'bg-orange text-cream': step.id === currentStep,
                    'bg-charcoal text-cream': step.id < currentStep,
                    'bg-lightgray text-darkgray': step.id > currentStep,
                    'cursor-pointer hover:bg-orange/80': onStepClick && step.id < currentStep,
                    'cursor-default': !onStepClick || step.id >= currentStep
                  }
                )}
              >
                {step.id < currentStep ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>

              {/* Step Info */}
              <div className="ml-4">
                <p className={clsx(
                  'text-base font-bold transition-colors',
                  {
                    'text-charcoal': step.id <= currentStep,
                    'text-darkgray/60': step.id > currentStep
                  }
                )}>
                  {step.name}
                </p>
                <p className="text-sm text-darkgray/80">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    'flex-1 h-1 mx-6 transition-colors rounded-full',
                    {
                      'bg-orange': step.id < currentStep,
                      'bg-lightgray': step.id >= currentStep
                    }
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-6">
          <p className="text-lg font-bold text-charcoal">
            Step {currentStep} of {totalSteps}
          </p>
          <p className="text-base font-medium text-darkgray">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-lightgray rounded-full h-3 mb-6">
          <div
            className="bg-orange h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Current Step Info */}
        <div className="text-center">
          <h3 className="text-2xl font-black text-charcoal">
            {steps[currentStep - 1]?.name}
          </h3>
          <p className="text-base text-darkgray mt-2">
            {steps[currentStep - 1]?.description}
          </p>
        </div>

        {/* Step Dots */}
        <div className="flex justify-center mt-8 space-x-3">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => onStepClick?.(step.id)}
              disabled={!onStepClick || step.id >= currentStep}
              className={clsx(
                'w-3 h-3 rounded-full transition-colors duration-200',
                {
                  'bg-orange': step.id <= currentStep,
                  'bg-lightgray': step.id > currentStep
                }
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}