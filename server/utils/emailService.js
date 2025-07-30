const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password
  },
});

// Send event notification email
const sendEventNotification = async (event, recipientEmail) => {
  try {
    const eventDate = new Date(event.date);
    const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let timeInfo = '';
    if (event.isFullDay) {
      timeInfo = 'Full Day Event';
    } else {
      timeInfo = `${event.startTime} - ${event.endTime}`;
    }

    const mailOptions = {
      from: `"CCMS" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Event Notification: ${event.title}`,
      text: `You have been tagged in an event: ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px;">
          <h2 style="color: #333333; font-weight: normal; margin-bottom: 20px;">Event Notification</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px;">${event.title}</h3>
            <p style="color: #555555; margin: 0 0 15px 0; line-height: 1.6;">${event.description}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 5px 0; color: #333333;"><strong>Hosted By:</strong> ${event.hostedBy}</p>
            <p style="margin: 5px 0; color: #333333;"><strong>Date:</strong> ${formattedDate} (${dayOfWeek})</p>
            <p style="margin: 5px 0; color: #333333;"><strong>Time:</strong> ${timeInfo}</p>
            <p style="margin: 5px 0; color: #333333;"><strong>Assigned By:</strong> ${event.createdBy} (${event.createdByEmail})</p>
          </div>

          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff;">
            <p style="margin: 0; color: #0056b3; font-size: 14px;">
              <strong>Note:</strong> You have been tagged in this event. Please mark your calendar and attend as required.
            </p>
          </div>

          <p style="font-size: 14px; color: #999999; margin-top: 30px; text-align: center;">
            – CCMS Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Event notification sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending event notification:', error);
    return false;
  }
};

// Send event notifications to multiple recipients
const sendEventNotifications = async (event, recipientEmails) => {
  const results = [];
  
  for (const email of recipientEmails) {
    try {
      const success = await sendEventNotification(event, email);
      results.push({ email, success });
    } catch (error) {
      console.error(`Failed to send notification to ${email}:`, error);
      results.push({ email, success: false, error: error.message });
    }
  }
  
  return results;
};

module.exports = {
  sendEventNotification,
  sendEventNotifications
}; 