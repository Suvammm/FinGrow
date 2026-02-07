import React, { useState } from 'react';
import './Opportunities.css';

const Opportunities = () => {
  const [activeRegion, setActiveRegion] = useState("Bengaluru");

  const localProjects = [
    {
      id: 1,
      title: "Green Valley Smart City",
      type: "Real Estate (Residential)",
      area: "Whitefield, Bengaluru",
      status: "Upcoming (Q4 2026)",
      expectedROI: "12-15% p.a.",
      contact: "+91 98765 43210",
      description: "A sustainable housing project with AI-driven energy management."
    },
    {
      id: 2,
      title: "Tech-Hub Commercial Plaza",
      type: "Commercial Lease",
      area: "HSR Layout, Bengaluru",
      status: "On-going Construction",
      expectedROI: "8% Rental Yield",
      contact: "invest@techhubplaza.com",
      description: "High-yield commercial spaces tailored for tech startups."
    }
  ];

  const investmentGuide = [
    { step: 1, action: "KYC Verification", detail: "Complete your PAN and Aadhaar linkage on our partner portal." },
    { step: 2, action: "Site Visit/Demo", detail: "Schedule a virtual or physical visit using the contact details provided." },
    { step: 3, action: "Escrow Payment", detail: "Secure your investment via our RERA-approved escrow accounts." }
  ];

  return (
    <div className="opportunities-container">
      <header className="opp-header">
        <h1>Investment Opportunities</h1>
        <p>Verified upcoming projects and high-growth land in {activeRegion}</p>
      </header>

      <div className="opp-layout">
        {/* PROJECTS SECTION */}
        <section className="projects-grid">
          <h2>📍 On-going & Upcoming Projects</h2>
          {localProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-badge">{project.status}</div>
              <h3>{project.title}</h3>
              <p className="project-type">{project.type}</p>
              <div className="project-stats">
                <span><strong>ROI:</strong> {project.expectedROI}</span>
                <span><strong>Location:</strong> {project.area}</span>
              </div>
              <p className="project-desc">{project.description}</p>
              <div className="contact-box">
                <small>Interested? Contact:</small>
                <strong>{project.contact}</strong>
              </div>
              <button className="invest-btn">View Brochure</button>
            </div>
          ))}
        </section>

        {/* HOW TO INVEST SIDEBAR */}
        <aside className="guide-sidebar">
          <h3>📘 How to Invest</h3>
          <div className="guide-timeline">
            {investmentGuide.map(item => (
              <div key={item.step} className="guide-step">
                <div className="step-num">{item.step}</div>
                <div className="step-text">
                  <strong>{item.action}</strong>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="expert-card">
            <p>Need a personal advisor?</p>
            <button className="advisor-btn">Speak to an Expert</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Opportunities;