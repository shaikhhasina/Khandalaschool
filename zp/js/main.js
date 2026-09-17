// ==========================================================================
// Admission Enquiry form -> Firestore
// Collection: "admissionEnquiries"
// ==========================================================================

const enquiryForm = document.getElementById('enquiryForm');
const enquiryMsg = document.getElementById('enquiryMsg');

if (enquiryForm) {
  enquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = enquiryForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const data = {
      studentName: enquiryForm.studentName.value.trim(),
      parentName: enquiryForm.parentName.value.trim(),
      mobile: enquiryForm.mobile.value.trim(),
      classApplying: enquiryForm.classApplying.value,
      message: enquiryForm.message.value.trim(),
      status: 'new',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await db.collection('admissionEnquiries').add(data);
      enquiryMsg.textContent = 'Thank you! Your enquiry has been submitted. Our team will contact you soon.';
      enquiryMsg.className = 'form-msg success';
      enquiryForm.reset();
    } catch (err) {
      console.error(err);
      enquiryMsg.textContent = 'Something went wrong. Please try again or call the school office.';
      enquiryMsg.className = 'form-msg error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Enquiry';
    }
  });
}
