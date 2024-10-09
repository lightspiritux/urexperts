import React, { useState } from 'react'

interface PatientReportFormProps {
  onSubmit: (data: string) => Promise<void>
}

const PatientReportForm: React.FC<PatientReportFormProps> = ({ onSubmit }) => {
  const [patientData, setPatientData] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(patientData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="patient-report-form">
      <textarea
        value={patientData}
        onChange={(e) => setPatientData(e.target.value)}
        placeholder="Paste patient data here..."
        required
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Report'}
      </button>
    </form>
  )
}

export default PatientReportForm