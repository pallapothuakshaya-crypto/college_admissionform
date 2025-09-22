const form = document.getElementById('admissionForm');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = 'Submitting...';

  const formData = new FormData(form);

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Network response not ok');

    msg.textContent = '✅ Form submitted successfully!';
    setTimeout(()=> msg.textContent = '', 4000);
    form.reset();
  } catch (err) {
    console.error(err);
    msg.textContent = '❌ Submission failed. Try again.';
  }
});
