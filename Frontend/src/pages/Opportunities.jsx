import React, { useState } from 'react';
import './Opportunities.css';

const Opportunities = () => {
  const activeRegion = "Bengaluru";
  const [selectedBrochureId, setSelectedBrochureId] = useState(null);

  const localProjects = [
    {
      id: 1,
      title: "Green Valley Smart City",
      type: "Real Estate (Residential)",
      area: "Whitefield, Bengaluru",
      status: "Upcoming (Q4 2026)",
      expectedROI: "12-15% p.a.",
      contact: "+91 98765 43210",
      description: "A sustainable housing project with AI-driven energy management.",
      brochure: {
        priceRange: "INR 72L - 1.45Cr",
        possession: "December 2026",
        minTicketSize: "INR 10L booking + milestone payments",
        keyHighlights: [
          "1/2/3 BHK inventory with smart-meter integration",
          "Clubhouse, rooftop solar, water recycling plant",
          "Near ITPL, metro extension and upcoming ring road",
        ],
      },
    },
    {
      id: 2,
      title: "Tech-Hub Commercial Plaza",
      type: "Commercial Lease",
      area: "HSR Layout, Bengaluru",
      status: "On-going Construction",
      expectedROI: "8% Rental Yield",
      contact: "invest@techhubplaza.com",
      description: "High-yield commercial spaces tailored for tech startups.",
      brochure: {
        priceRange: "INR 1.1Cr - 4.8Cr",
        possession: "Phase-1: June 2027",
        minTicketSize: "INR 25L initial commitment",
        keyHighlights: [
          "Grade-A commercial floors with LEED design",
          "Pre-leasing support for startup and co-working tenants",
          "Projected occupancy ramp in 18-24 months post handover",
        ],
      },
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
              <button
                className="invest-btn"
                type="button"
                onClick={() =>
                  setSelectedBrochureId((prev) => (prev === project.id ? null : project.id))
                }
              >
                {selectedBrochureId === project.id ? 'Hide Brochure' : 'View Brochure'}
              </button>
              {selectedBrochureId === project.id ? (
                <div className="brochure-panel">
                  <h4>{project.title} Brochure</h4>
                  <div className="brochure-grid">
                    <p><strong>Price Range:</strong> {project.brochure.priceRange}</p>
                    <p><strong>Possession:</strong> {project.brochure.possession}</p>
                    <p><strong>Minimum Ticket:</strong> {project.brochure.minTicketSize}</p>
                  </div>
                  <ul>
                    {project.brochure.keyHighlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </section>

        {/* HOW TO INVEST SIDEBAR */}
        <aside className="guide-sidebar">
          <div className="guide-sidebar-head">
            <span className="guide-chip">Investor Guide</span>
            <h3>How to Invest</h3>
            <p>Move from interest to allocation with a simple three-step flow.</p>
          </div>
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
          <div className="guide-note">
            <strong>Quick tip:</strong>
            <span> Compare ticket size, delivery date and exit horizon before booking.</span>
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
