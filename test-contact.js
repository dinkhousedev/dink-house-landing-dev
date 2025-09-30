// Quick test of contact form API
const testData = {
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  message: "This is a test message from the debugging script.",
  recaptchaToken: "test-token"
};

fetch("http://localhost:3003/api/contact-form", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testData),
})
  .then(res => res.json())
  .then(data => {
    console.log("Response:", JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error("Error:", err.message);
  });