import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import leftImage from './imgs/left.png';
import rightImage from './imgs/right.png';
import backgroundImage from './imgs/background.png';
import smalldots from './imgs/smalldots.jpeg';
import pdfToText from 'react-pdftotext';
import ReactMarkdown from 'react-markdown';
import { IoPencil } from "react-icons/io5"; // Pencil icon for editing

const MarkdownRenderer = ({ content }) => {
  return <ReactMarkdown>{content}</ReactMarkdown>;
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

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav style={navStyle}>
      <div style={logoStyle}>
        NRGHacks
      </div>
      <ul style={tabListStyle}>
        <li><HoverButton style={tabItemStyle(activeTab === 'Apply')} onClick={() => setActiveTab('Apply')}>Apply</HoverButton></li>
        <li><HoverButton style={tabItemStyle(activeTab === 'Decisions')} onClick={() => setActiveTab('Decisions')}>Decisions</HoverButton></li>
        <li><HoverButton style={tabItemStyle(activeTab === 'Profile')} onClick={() => setActiveTab('Profile')}>Profile</HoverButton></li>
      </ul> 
    </nav>
  );
};

const DecisionCard = ({ decision }) => {
  return (
    <div style={decisionCardStyle}>
      <MarkdownRenderer content={decision.description} />
    </div>
  );
};

const ApplyView = ({ cards, handleDelete }) => {
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

const DecisionsView = ({ decisions }) => {
  return (
    <div style={decisionsViewStyle}>
      <div style={columnStyle}>
        <h2 style={columnHeaderStyle}>Rejects</h2>
        {decisions.filter(d => d.direction === 'left').map((decision, index) => (
          <DecisionCard key={index} decision={decision} />
        ))}
      </div>
      <div style={columnStyle}>
        <h2 style={columnHeaderStyle}>Accepted</h2>
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
    name: "John Doe",
    age: 25,
    email: "johndoe@example.com",
    phone: "(123) 456-7890",
    address: "NRGHacks",
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
      {/* Left section - Personal Info */}
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

        {/* Upload Resume button only if no resume is uploaded */}
        {!resume && (
          <>
            <label htmlFor="resume-upload" style={uploadButtonStyle}>Upload Resume</label>
            <input id="resume-upload" type="file" accept=".pdf" onChange={handleFileUpload} style={fileInputStyle} />
          </>
        )}
      </div>

      {/* Right section - Resume Preview */}
      {resume && (
        <div style={previewContainerStyle}>
          <iframe src={resume} title="Resume Preview" style={previewStyle}></iframe>
        </div>
      )}
    </div>
  );
};



const App = () => {
  const [activeTab, setActiveTab] = useState('Apply');
  const [cards, setCards] = useState([
    {
      id: 1,
      description: "**Software Engineer**\n\nCompany: Google\n\nLocation: Mountain View, CA\n\nSalary: $120,000 - $150,000\n\nDescription: We are looking for a skilled software engineer with experience in React and Node.js.",
    },
    {
      id: 2,
      description: "**Data Scientist**\n\nCompany: Meta\n\nLocation: Menlo Park, CA\n\nSalary: $110,000 - $140,000\n\nDescription: Join our AI research team and help analyze large-scale datasets.",
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
        {activeTab === 'Decisions' && <DecisionsView decisions={decisions} />}
        {activeTab === 'Profile' && <CandidateInfoView />}
      </div>
    </div>
  );
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
  overflow: 'hidden',
  backgroundImage: `url(${smalldots})`,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
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

const contentStyle = {
  flex: 1,
  display: 'flex',
  overflow: 'hidden',
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
  backgroundSize: 'cover',
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



export default App;
