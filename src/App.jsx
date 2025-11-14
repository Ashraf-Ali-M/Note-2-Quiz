import { useState } from 'react'
import './App.css'
import Quiz from './Quiz'

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const [quizData, setQuizData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [recapData, setRecapData] = useState(null);
  const [isRecapping, setIsRecapping] = useState(false);

  const [numQuestions, setNumQuestions] = useState(5);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadStatus('');
    setQuizData(null); 
    setRecapData(null);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('num_questions', numQuestions);

    setIsGenerating(true);
    setUploadStatus(`Uploading and generating ${numQuestions}-question quiz...`);
    setQuizData(null);
    setRecapData(null); 

    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        setUploadStatus(`Error: ${data.error}`);
      } else if (data.questions) {
        setQuizData(data); 
        setUploadStatus('');
      } else {
        setUploadStatus('Received an unexpected response from server.');
      }
    })
    .catch(error => {
      console.error('Error uploading file:', error);
      setUploadStatus('Upload failed. See console for details.');
    })
    .finally(() => {
      setIsGenerating(false);
    });
  };

  const handleRecap = () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);

    setIsRecapping(true);
    setUploadStatus('Uploading and generating recap...');
    setQuizData(null);
    setRecapData(null);

    fetch('/api/recap', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        setUploadStatus(`Error: ${data.error}`);
      } else if (data.recap) {
        setRecapData(data.recap);
        setUploadStatus('');
      } else {
        setUploadStatus('Received an unexpected response from server.');
      }
    })
    .catch(error => {
      console.error('Error uploading file:', error);
      setUploadStatus('Upload failed. See console for details.');
    })
    .finally(() => {
      setIsRecapping(false);
    });
  };
  
  const handleBackToUpload = () => {
    setQuizData(null);
    setRecapData(null);
    setSelectedFile(null);
  };
  
  return (
    <div className="App">
      <h1>Note2Quiz</h1>

      {quizData ? (
        <>
          <Quiz quizData={quizData} />
          <button onClick={handleBackToUpload} style={{marginTop: '1rem'}}>
            Upload New PDF
          </button>
        </>
      ) : (
        <div className="upload-section">
          <p>Upload your course notes (PDF) to get started.</p>
          <div className="button-container">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              key={selectedFile ? 'file-selected' : 'file-none'}
            />
            
            <div className="quiz-options">
              <label htmlFor="num-questions">Questions: </label>
              <select 
                id="num-questions"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                disabled={isGenerating || isRecapping}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>

            <button 
              className="button-quiz"
              onClick={handleUpload} 
              disabled={isGenerating || isRecapping || !selectedFile}
            >
              {isGenerating ? 'Generating...' : 'Generate Quiz'}
            </button>
            <button 
              className="button-recap"
              onClick={handleRecap} 
              disabled={isGenerating || isRecapping || !selectedFile}
            >
              {isRecapping ? 'Generating Recap...' : 'Get Short Recap'}
            </button>
          </div>
          {uploadStatus && <p>{uploadStatus}</p>}
        </div>
      )}

      {recapData && !quizData && (
        <div className="recap-section">
          <h2>Short Recap</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{recapData}</p>
        </div>
      )}
    </div>
  )
}

export default App