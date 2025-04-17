import React, { FormEvent } from 'react';
import style from './ContactUs.module.css';

const ContactUs: React.FC = () => {
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    const formData = new FormData(form);
    formData.append('access_key', '79daefad-dcdd-495e-8e56-a407363926ee');

    const payload = JSON.stringify(Object.fromEntries(formData.entries()));

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: payload,
      });

      const result = await response.json();

      if (result.success) {
        alert('Email sent successfully!');
        form.reset();
      } else {
        alert('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div id="contactus">
      <div className={style.ContactUsTitle}>
        <h3>Contact Us</h3>
        <p className={style.ContactUsSubTitle}>
          For inquiries or support, contact us and we&apos;ll respond promptly
        </p>
      </div>

      <div className={style.contactUsForm}>
        <form onSubmit={onSubmit}>
          <div className={style.inputbox}>
            <label htmlFor="user_name">Full Name</label>
            <input
              type="text"
              id="user_name"
              name="user_name"
              className={style.field}
              placeholder="Enter your Full Name"
              required
            />
          </div>

          <div className={style.inputbox}>
            <label htmlFor="user_email">Email Address</label>
            <input
              type="email"
              id="user_email"
              name="user_email"
              className={style.field}
              placeholder="Enter your Email address"
              required
            />
          </div>

          <div className={style.inputbox}>
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              className={style.field}
              placeholder="Enter the Subject"
              required
            />
          </div>

          <div className={style.inputbox}>
            <label htmlFor="message">Your Message</label>
            <textarea
              id="message"
              name="message"
              className={style['field-mess']}
              placeholder="Enter your message"
              required
            />
          </div>

          <button type="submit" className={style.contactButton}>
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
