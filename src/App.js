import React, { useState, useEffect, useCallback } from 'react';
import * as pdfjsLib from "pdfjs-dist/webpack";
import ReactMarkdown from 'react-markdown';
import { IoPencil } from "react-icons/io5";
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import Card from './Card';

import leftImage from './imgs/left.png';
import rightImage from './imgs/right.png';
import backgroundImage from './imgs/background.png';
import smalldots from './imgs/smalldots.jpeg';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

const API_KEY = "AIzaSyD9K3Ayr4c32R4x54WI5K7fQ2gL0QN3yaI";

const MarkdownRenderer = ({ content }) => {
  return <ReactMarkdown>{content}</ReactMarkdown>;
};

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav style={navStyle}>
      <div style={logoStyle}>NRGHacks</div>
      <ul style={tabListStyle}>
        <li>
          <HoverButton
            style={tabItemStyle(activeTab === 'Apply')}
            onClick={() => setActiveTab('Apply')}
          >
            Generate Resume
          </HoverButton>
        </li>
        <li>
          <HoverButton
            style={tabItemStyle(activeTab === 'Swipe')}
            onClick={() => setActiveTab('Swipe')}
          >
            Swipe!
          </HoverButton>
        </li>
        <li>
          <HoverButton
            style={tabItemStyle(activeTab === 'Decisions')}
            onClick={() => setActiveTab('Decisions')}
          >
            Applied
          </HoverButton>
        </li>
        <li>
          <HoverButton
            style={tabItemStyle(activeTab === 'Profile')}
            onClick={() => setActiveTab('Profile')}
          >
            Profile
          </HoverButton>
        </li>
      </ul> 
    </nav>
  );
};

const ApplyView = () => {
  const [uploadedText, setUploadedText] = useState(""); 
  const [generatedResumes, setGeneratedResumes] = useState({}); 

  const jobs = [
    { id: 1, title: "Software Engineer", description: "Develop and maintain software applications." },
    { id: 2, title: "Government Relations Intern",    description: "develop and implement strategic advocacy initiatives, analyze policy and legislative developments, and engage with key stakeholders, including government officials and industry leaders. This role requires expertise in public policy, regulatory affairs, and relationship management to support the government’s legislative and policy priorities." },
    { id: 3, title: "UX Designer",       description: "Design intuitive user experiences for web/mobile apps." }
  ];

  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (e) => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          text += textContent.items.map((item) => item.str).join(" ") + "\n";
        }
        setUploadedText(text);
      } catch (err) {
        console.error("Error reading PDF:", err);
      }
    };
  };

  
  const generateLatexResume = async (job) => {
    if (!uploadedText) {
      alert("Please upload your resume before generating a new one.");
      return;
    }

    try {
      console.log("Generating LaTeX Resume for:", job.title);

      
      const genAI = new GoogleGenerativeAI(API_KEY);
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      
      const prompt = `
            
       Here’s a refined prompt that ensures Gemini does not fabricate information, does not include placeholders like "list languages," and strictly adheres to the extracted resume text:

      ---

      **Prompt:**

      You are a professional resume writer specializing in technical resumes. Your task is to generate a **one-page** LaTeX resume based on the extracted text from my existing resume, ensuring all information is accurate, relevant, and properly formatted.  

      Use the **provided LaTeX resume template by Jake Gutierrez** as the foundation. **Do not remove any LaTeX commands unless they are placeholders meant to be replaced.**  

      ### Instructions:
      - **Only use information from the extracted resume text.** **Do not** invent new details, list generic placeholders (e.g., "list languages"), or fabricate experience, skills, or projects.  
      - **If specific information is missing** (e.g., no programming languages or skills are provided), leave those sections out rather than making assumptions.  
      - **Emphasize** accomplishments relevant to the **Senior Software Engineer** role, especially experience with **microservices, DevOps, software architecture, or other advanced technical skills** that appear in the extracted text.  
      - **Paraphrase** resume content to avoid direct copying while maintaining accuracy and clarity.  
      - **Exclude irrelevant experiences** and rewrite vague or overly broad descriptions to be more **concise and impact-driven.**  
      - **If professional experience is limited**, focus on relevant projects, coursework, internships, or open-source contributions.  

      ### Job Target:
      **Job Title:** ${job.title}  
      **Job Description:** ${job.description}  

      ### Extracted Resume Text:  
      """
      ${uploadedText}
      """  

      **Output the complete, properly formatted LaTeX resume following these instructions.**
      `;

      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const latexResume = await response.text();

      
      setGeneratedResumes((prev) => ({
        ...prev,
        [job.id]: latexResume,
      }));
    } catch (error) {
      console.error("Error generating LaTeX resume:", error);
      alert("Failed to generate resume. Check console for details.");
    }
  };

  
  const downloadLatexResume = (jobId, latexContent) => {
    if (!latexContent) return;
    const blob = new Blob([latexContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resume_${jobId}.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Your Resume (PDF)</h2>
      <input type="file" accept=".pdf" onChange={handleFileUpload} />

      {uploadedText && (
        <p style={{ marginTop: "10px" }}>✅ Resume parsed successfully! You can now generate tailored LaTeX resumes.</p>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h3>Job Openings</h3>
      {jobs.map((job) => (
        <div key={job.id} style={jobCardStyle}>
          <h4>{job.title}</h4>
          <p>{job.description}</p>
          <button onClick={() => generateLatexResume(job)} style={generateButtonStyle}>
            Generate LaTeX Resume
          </button>

          
          {generatedResumes[job.id] && (
            <div style={resumePreviewStyle}>
              <h4>Generated Resume (LaTeX):</h4>
              <pre>{generatedResumes[job.id]}</pre>
              <button
                onClick={() => downloadLatexResume(job.id, generatedResumes[job.id])}
                style={generateButtonStyle}
              >
                Download .tex
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const SwipeView = ({ cards, handleDelete }) => {
  const [overlayColor, setOverlayColor] = useState(null);
  const [leftImageSize, setLeftImageSize] = useState(75);
  const [rightImageSize, setRightImageSize] = useState(75);

  const handleSwipeDelete = (direction, description) => {
    handleDelete(direction, description);
    if (direction === 'left') {
      setOverlayColor('rgba(255, 0, 0, 0.15)');
      setLeftImageSize(100);
      setTimeout(() => setLeftImageSize(75), 500);
    } else if (direction === 'right') {
      setOverlayColor('rgba(0, 255, 0, 0.15)');
      setRightImageSize(100);
      setTimeout(() => setRightImageSize(75), 500);
    }
    setTimeout(() => {
      setOverlayColor(null);
    }, 500);
  };

  return (
    <div style={cardAreaStyle}>
      
      {overlayColor && <div style={{ ...overlayStyle, backgroundColor: overlayColor }} />}
      <img src={leftImage} alt="Left" style={{ ...sideImageStyle, left: '75px', width: `${leftImageSize}px` }} />
      <img src={rightImage} alt="Right" style={{ ...sideImageStyle, right: '75px', width: `${rightImageSize}px` }} />
      {cards.map(card => (
        <Card
          key={card.id}
          description={card.description}
          onDelete={handleSwipeDelete}
        />
      ))}
    </div>
  );
};

const DecisionCard = ({ decision }) => {
  return (
    <div style={decisionCardStyle}>
      <MarkdownRenderer content={decision.description} />
    </div>
  );
};

const DecisionsView = ({ decisions }) => {
  return (
    <div style={decisionsViewStyle}>
      
      <div style={columnStyle}>
        <h2 style={columnHeaderStyle}>Applied</h2>
        {decisions.filter(d => d.direction === 'right').map((decision, index) => (
          <DecisionCard key={index} decision={decision} />
        ))}
      </div>
    </div>
  );
};

const CandidateInfoView = () => {
  const [resume, setResume] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState({
    name: "Hayric Chai",
    age: 16,
    email: "ilovenrghacks@example.com",
    phone: "(647)-647-6477",
    address: "123 NRGHacks Dr, Toronto, ON",
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResume(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e, field) => {
    setCandidateInfo({ ...candidateInfo, [field]: e.target.value });
  };

  return (
    <div style={candidateInfoWrapperStyle}>
      
      <div style={candidateInfoContainerStyle}>
        <div style={headerContainerStyle}>
          <h2 style={headerStyle}>Personal Information</h2>
          <IoPencil style={editIconStyle} onClick={handleEditToggle} />
        </div>

        {Object.keys(candidateInfo).map((field) => (
          <div key={field} style={infoBoxStyle}>
            <label style={labelStyle}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
            {isEditing ? (
              <input type="text" value={candidateInfo[field]} onChange={(e) => handleChange(e, field)} style={inputStyle} />
            ) : (
              <p style={infoTextStyle}>{candidateInfo[field]}</p>
            )}
          </div>
        ))}

        
        {!resume && (
          <>
            <label htmlFor="resume-upload" style={uploadButtonStyle}>Upload Resume</label>
            <input id="resume-upload" type="file" accept=".pdf" onChange={handleFileUpload} style={fileInputStyle} />
          </>
        )}
      </div>

      
      {resume && (
        <div style={previewContainerStyle}>
          <iframe src={resume} title="Resume Preview" style={previewStyle}></iframe>
        </div>
      )}
    </div>
  );
};


export default function App() {
  const [activeTab, setActiveTab] = useState('Apply');
    const [cards, setCards] = useState([
      {
        id: 1,
        description: "**Software Engineer**\n\nCompany: Google\n\nLocation: Mountain View, CA\n\nSalary: $120,000 - $150,000\n\nDescription: We are looking for a skilled software engineer with experience in React and Node.js.",
      },
      {
        id: 2,
        description: "**Government Relations Intern\n\nLocation: Ottawa, CA\n\nSalary: $110,000 - $140,000\n\nDescription: develop and implement strategic advocacy initiatives, analyze policy and legislative developments, and engage with key stakeholders, including government officials and industry leaders. This role requires expertise in public policy, regulatory affairs, and relationship management to support the government’s legislative and policy priorities.",
      },
      {
        id: 3,
        description: "**UX Designer**\n\nCompany: Apple\n\nLocation: Cupertino, CA\n\nSalary: $100,000 - $130,000\n\nDescription: Seeking a creative UX designer to craft intuitive user experiences.",
      },
    ]);
    const [decisions, setDecisions] = useState([]);
  
    useEffect(() => {
      const storedDecisions = JSON.parse(localStorage.getItem('cardLogs') || '[]');
      setDecisions(storedDecisions);
    }, []);
  
    const handleDelete = (direction, description) => {
      const updatedDecisions = [...decisions, { direction, description }];
      localStorage.setItem('cardLogs', JSON.stringify(updatedDecisions));
      setDecisions(updatedDecisions);
      setCards(cards.filter(card => card.description !== description));
    };
  
    return (
      <div style={appContainerStyle}>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div style={contentStyle}>
          {activeTab === 'Apply' && <ApplyView cards={cards} handleDelete={handleDelete} />}
          {activeTab === 'Swipe' && <SwipeView cards={cards} handleDelete={handleDelete} />}
          {activeTab === 'Decisions' && <DecisionsView decisions={decisions} />}
          {activeTab === 'Profile' && <CandidateInfoView />}
        </div>
      </div>
    );
  };


const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 2rem',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
};

const logoStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#007bff',
};

const tabListStyle = {
  display: 'flex',
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const tabItemStyle = (isActive) => ({
  margin: '0 1rem',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  borderRadius: '4px',
  borderStyle: 'none',
  backgroundColor: isActive ? '#e6f2ff' : 'transparent',
  color: isActive ? '#007bff' : '#333',
  transition: 'all 0.3s',
});

const jobCardStyle = {
  border: "1px solid lightgray",
  padding: "10px",
  borderRadius: "5px",
  marginBottom: "10px",
};

const generateButtonStyle = {
  backgroundColor: "#007bff",
  color: "white",
  padding: "8px 15px",
  borderRadius: "5px",
  cursor: "pointer",
  border: "none",
  marginTop: "10px"
};

const resumePreviewStyle = {
  backgroundColor: "#f8f9fa",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "5px",
};


const styleSheet = document.styleSheets[0];
const keyframes = `@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

const logoImageStyle = {
  width: '3rem',
  height: '3rem',
  marginRight: '0.5rem',
};

const appContainerStyle = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
  userSelect: 'none',
  overflow: 'scroll',
  backgroundImage: `url(${smalldots})`,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
};

const contentStyle = {
  flex: 1,
  display: 'flex',
  overflow: 'scroll',
};

const cardAreaStyle = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
};


const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 10,
  pointerEvents: 'none',
  transition: 'background-color 0.5s ease',
};

const sideImageStyle = {
  position: 'absolute',
  transition: 'width 0.5s ease',
};

const decisionsViewStyle = {
  display: 'flex',
  width: '100%',
  height: '100%',
  backgroundColor: '#f5f5f5',
};

const columnStyle = {
  flex: 1,
  padding: '1rem',
  overflowY: 'auto',
  backgroundImage: `url(${smalldots})`,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  boxShadow: 'inset 1px 20px 50px -30px rgba(0,0,0,0.4)',
};

const columnHeaderStyle = {
  textAlign: 'center',
  marginBottom: '1rem',
  color: '#007bff',
};

const decisionCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

/* Styles */
const candidateInfoWrapperStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '100%',
  width: '100vw',
  padding: '0 10%',
};

const candidateInfoContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  textAlign: 'left',
  color: '#333',
  width: '50%',
};

/* Header styling */
const headerContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '20px',
};

const headerStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '1rem'
};

const editIconStyle = {
  fontSize: '20px',
  cursor: 'pointer',
  color: '#007bff',
};

/* Info box styling */
const infoBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f8f9fa',
  padding: '10px 15px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  width: '400px',
  marginBottom: '10px',
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#555',
};

const infoTextStyle = {
  fontSize: '16px',
  marginTop: '5px',
};

/* Input field styling */
const inputStyle = {
  fontSize: '16px',
  padding: '5px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

/* Upload button */
const uploadButtonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  display: 'inline-block',
  marginTop: '15px',
};

const fileInputStyle = {
  display: 'none',
};

/* Resume Preview */
const previewContainerStyle = {
  width: '50%',
  display: 'flex',
  justifyContent: 'center',
};

const previewStyle = {
  width: '100%',
  height: '500px',
  border: '1px solid #ccc',
};




const HoverButton = (props) => {
  const [isHover, setIsHover] = useState(false);
  const [isClick, setIsClick] = useState(false);

  const handleMouseOver = () => setIsHover(true);
  const handleMouseOut = () => setIsHover(false);
  const handleClick = (event) => {
    setIsClick(true);
    setTimeout(() => setIsClick(false), 200);
    if (props.onClick) {
      props.onClick(event);
    }
  };

  return (
    <button
      {...props}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={handleClick}
      style={{
        ...props.style,
        backgroundColor: isClick ? 'skyblue' : isHover ? '#0056b3' : '#007bff',
        color: isClick ? 'black' : 'white',
        borderStyle: isClick ? 'solid' : 'none',
        borderWidth: '2px',
      }}
    >
      {props.children}
    </button>
  );
};
