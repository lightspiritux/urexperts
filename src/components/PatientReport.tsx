import React from 'react'

interface PatientReportProps {
  report: string
}

const PatientReport: React.FC<PatientReportProps> = ({ report }) => {
  return (
    <div className="patient-report">
      <h3>Generated Patient Report</h3>
      <pre>{report}</pre>
    </div>
  )
}

export default PatientReport