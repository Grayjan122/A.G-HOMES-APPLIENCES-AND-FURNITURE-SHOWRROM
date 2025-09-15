// components/EmailForm.js
import { useState } from 'react';

const EmailForm = () => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
    from: '',
    from_name: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Replace with your actual PHP endpoint URL
      const response = await fetch('http://localhost/capstone-api/api/send-email.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: result.message || 'Email sent successfully!'
        });
        // Reset form
        setFormData({
          to: '',
          subject: '',
          message: '',
          from: '',
          from_name: ''
        });
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Failed to send email'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Send Email
      </h2>
      
      {status.message && (
        <div className={`mb-4 p-3 rounded ${
          status.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-400' 
            : 'bg-red-100 text-red-700 border border-red-400'
        }`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="from_name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="from_name"
            name="from_name"
            value={formData.from_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">
            Your Email
          </label>
          <input
            type="email"
            id="from"
            name="from"
            value={formData.from}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
            To Email *
          </label>
          <input
            type="email"
            id="to"
            name="to"
            value={formData.to}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="recipient@example.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email subject"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your message here..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Sending...' : 'Send Email'}
        </button>
      </form>
    </div>
  );
};

export default EmailForm;