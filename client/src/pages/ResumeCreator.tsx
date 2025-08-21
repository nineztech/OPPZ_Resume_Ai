import React from 'react';
import { tokenUtils } from '@/lib/utils'; // make sure this is working
import { Button } from '@/components/ui/button';

const ResumeCreator = () => {
  const handleSaveResume = async () => {
    const token = tokenUtils.getToken(); // 👈 your stored JWT from login
    if (!token) {
      console.error("No token found. Please login first.");
      return;
    }

    const resumePayload = {
      title: "Frontend Resume",
      templateId: "template1",
      selectedColor: "green",
      resumeData: {
        name: "John Doe",
        skills: ["React", "Node.js", "SQL"],
        experience: [
          {
            company: "ABC Corp",
            role: "Frontend Developer",
            duration: "2 years"
          }
        ],
        education: [
          {
            institution: "XYZ University",
            degree: "B.Tech in CSE"
          }
        ]
      }
    };

    try {
      const response = await fetch('http://localhost:5006/api/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resumePayload)
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Resume saved!");
        console.log(result); // you can also redirect or show it
      } else {
        alert("❌ Failed to save resume: " + result.message);
        console.error(result);
      }
    } catch (error) {
      console.error("Save Resume Error:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Create Resume</h2>
      <Button onClick={handleSaveResume}>Save Resume</Button>
    </div>
  );
};

export default ResumeCreator;
