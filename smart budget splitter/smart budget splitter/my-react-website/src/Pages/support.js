import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import NavBar from '../Components/NavBar';
import './support.css';


const Support = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus('');
  
    const templateParams = {
      name,
      email,
      message,
    };
  
    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID_1,  // Use the environment variable for Service ID 1
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID_1, // Use the environment variable for Template ID 1
        templateParams,
        process.env.REACT_APP_EMAILJS_USER_ID_1   // Use the environment variable for User ID 1
      );
      setSubmissionStatus('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmissionStatus('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  return (
    <div className="support-container">
      <NavBar />
      <div className="support-content">
        <h2>Contact Support</h2>
        <p>If you have any questions or need assistance, please fill out the form below.</p>

        <form onSubmit={handleSubmit} className="support-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="textarea"
            ></textarea>
          </div>

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        {submissionStatus && <p className="submission-status">{submissionStatus}</p>}
      </div>
    </div>
  );
};

export default Support;
