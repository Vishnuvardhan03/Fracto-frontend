const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5209/api/doctor');
    const doctors = res.data;
    console.log(`Found ${doctors.length} doctors.`);
    if (doctors.length > 0) {
      const doc = doctors[0];
      console.log(`Testing slots for doctor ${doc.doctorId || doc.id} on date 2026-03-26`);
      const slotsRes = await axios.get(`http://localhost:5209/api/availability/doctor/${doc.doctorId || doc.id}/slots?date=2026-03-26`);
      console.log('Slots response:', slotsRes.data);
    }
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}
test();
