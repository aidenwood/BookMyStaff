import React, { useEffect } from 'react'
import { useAppStore } from '../../lib/store'
import SetupStep1 from './SetupStep1'
import SetupStep2 from './SetupStep2'
import SetupStep3 from './SetupStep3'
import SetupStep4 from './SetupStep4'
import SetupStep5 from './SetupStep5'
import SetupStep6 from './SetupStep6'
import SetupProgress from './SetupProgress'

export default function BusinessSetup() {
  const { businessSetup } = useAppStore()

  const renderStep = () => {
    switch (businessSetup.currentStep) {
      case 1:
        return <SetupStep1 />
      case 2:
        return <SetupStep2 />
      case 3:
        return <SetupStep3 />
      case 4:
        return <SetupStep4 />
      case 5:
        return <SetupStep5 />
      case 6:
        return <SetupStep6 />
      default:
        return <SetupStep1 />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set Up Your Business
          </h1>
          <p className="text-gray-600">
            Let's get your booking system configured in just a few steps
          </p>
        </div>

        {/* Progress Indicator */}
        <SetupProgress currentStep={businessSetup.currentStep} totalSteps={6} />

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-soft p-8 mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}