import React, { useState, useRef } from 'react';
import {
  Sun,
  Moon,
  Clipboard,
  Download,
  Upload,
  Edit,
  Check,
  RotateCcw,
  Send,
} from 'lucide-react';
import './theme.css';
import URElogo from './assets/URElogo.png'; // Ensure correct capitalization

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [patientData, setPatientData] = useState('');
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const generateReport = async () => {
    if (!patientData.trim()) {
      setError('Please enter patient data before generating a report.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer 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',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4',
            messages: [
              {
                role: 'system',
                content: `You are an AI assistant that generates patient reports based on given data. Follow these guidelines strictly:

1. Format the report exactly as follows, ONLY INCLUDING SECTIONS WHERE INFORMATION IS PROVIDED:

Brief HPI: Provide a brief history of the present illness, including the chief complaint and any relevant patient history. ER Care (if applicable): Summarize the initial findings in the Emergency Room, including initial vitals, findings, and care provided. Include amount of PRN IV meds given in ER such as antiemetics, pain meds, benzo, antiarrhythmic, etc. (one paragraph)

MM/DD: Start with the date (MM/DD) and provide a concise, one-line update on the patient's progress for that day. Include amount of PRN IV meds given such as antiemetics, pain meds, benzo, antiarrhythmic, etc. (one line each, repeat for each day of progress notes given)

Vital Signs (VS): Include temperature (Temp), respiratory rate (Resp), heart rate (HR), blood pressure (BP), and oxygen saturation (SPo2). Mention the level of FiO2 and the system delivery (e.g., NC, BiPAP, HHFNC) if applicable. (on one line)

EKG: Include if available in one line (omit if not applicable)

Abnormal Labs: Include abnormal lab results only, and add baseline values if available. If there are no abnormal labs, exclude this section completely. (on one line)

Imaging: Report imaging results, each in one line. If no imaging is available, exclude this section completely.

Surgery/Procedure Details: Provide Date MM/DD, Procedure Name, and CPT Code if any procedures were performed. If no procedure was performed, exclude this section completely. (on one line)

Plan: Provide a summarized plan for that day. (one line or brief paragraph)

Summary of Status: Provide a brief explanation of why the chosen status (IP, OSV, Outpatient, PA) is appropriate based on the patient's condition and progression. (short paragraph)

Recommendation for status: Specify either Inpatient (IP), Observation (OSV), Outpatient, or Send to PA based on the clinical information provided.

InterQual Subset: Indicate the most appropriate InterQual Subset relevant to the case.

2. AVOID using words or expressions like "Stable," "Admitted to Observation," "Improving," or "No change."
3. Be concise and straight to the point.
4. DO NOT mention patient names, family names, or MD names for HIPAA purposes.
5. Do not include sections or data if the information is not provided.
6. Do not be creative or add information not provided in the patient data.
7. Follow the exact structure and wording specified above to ensure consistency and clarity.
8. If information for a section is not available, completely omit that section from the report.`,
              },
              {
                role: 'user',
                content: `Generate a patient report based on the following data: ${patientData}`,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReport(data.choices[0].message.content);
    } catch (err) {
      setError('Error generating report. Please try again.');
      console.error('Error generating report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then(
      (clipText) => setPatientData(clipText),
      (err) => console.error('Failed to read clipboard contents: ', err)
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report).then(
      () => console.log('Report copied to clipboard'),
      (err) => console.error('Failed to copy report: ', err)
    );
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([report], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'patient_report.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          setPatientData(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleEditReport = () => {
    setIsEditing(true);
  };

  const handleSaveReport = () => {
    setIsEditing(false);
    setReviewCount((prevCount) => prevCount + 1);
  };

  return (
    <div className={`app ${theme}`}>
      <header className={`header ${theme}-theme`}>
        <div className="logo-container">
          <img src="./src/assets/URElogo.png" alt="URExpert Logo" className="logo" />
        </div>
        <nav>
          <ul>
            <li>
              <a href="#">Prices</a>
            </li>
            <li>
              <a href="#">Features</a>
            </li>
            <li>
              <a href="#">Profile</a>
            </li>
            <li>
              <a href="#">Weekly Report</a>
            </li>
          </ul>
        </nav>
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
      </header>

      <main className={`maincontent ${theme}-theme`}>
        <h2>Tell me about your patient</h2>
        <p>Generate a completed AI-Powered Utilization Review</p>

        <div className="input-container">
          <textarea
            ref={textAreaRef}
            value={patientData}
            onChange={(e) => setPatientData(e.target.value)}
            placeholder="Paste patient data here..."
            className="patient-input"
          />
          <div className="input-actions">
            <button
              onClick={handlePaste}
              className="action-button"
              disabled={isLoading || report !== ''}
            >
              <Clipboard />
            </button>
            <button
              onClick={triggerFileInput}
              className="action-button"
              disabled={isLoading || report !== ''}
            >
              <Upload />
            </button>
            <button
              onClick={generateReport}
              className="action-button"
              disabled={isLoading || patientData === ''}
            >
              <RotateCcw />
            </button>
            <button
              onClick={generateReport}
              className="action-button"
              disabled={isLoading || patientData === ''}
            >
              <Send />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept=".txt,.doc,.docx,.pdf"
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        {report && (
          <div className="report-container">
            <h3>Generated Report</h3>
            <div className="report-content">
              {isEditing ? (
                <textarea
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  className="editable-report"
                />
              ) : (
                <pre>{report}</pre>
              )}
              <div className="report-actions">
                {isEditing ? (
                  <button onClick={handleSaveReport} className="action-button">
                    <Check />
                  </button>
                ) : (
                  <button onClick={handleEditReport} className="action-button">
                    <Edit />
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="action-button"
                  disabled={isEditing}
                >
                  <Clipboard />
                </button>
                <button
                  onClick={handleDownload}
                  className="action-button"
                  disabled={isEditing}
                >
                  <Download />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={`footer ${theme}-theme`}>
        <p>&copy; 2024 URExpert. All rights reserved.</p>
        <nav>
          <ul>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Terms of Service</a>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
          </ul>
        </nav>
      </footer>
    </div>
  );
};

export default App;
