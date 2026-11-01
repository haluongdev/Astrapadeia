import {test} from '@playwright/test';
test('GD3-MANUAL-01 Student QR/OTP full browser payment flow', async()=>{
  test.skip(true,'Requires stable UI selectors, test Student, and isolated test DB; not safe to create payment demo automatically on production data');
});
test('GD3-MANUAL-02 demo excluded from real revenue', async()=>{
  test.skip(true,'Requires authenticated isolated test database and baseline revenue comparison; read-only API cannot establish financial exclusion');
});
test('GD3-MANUAL-03 no discount or refund actions in UI', async()=>{
  test.skip(true,'Requires authenticated Student/QTV UI selectors and manual policy review; legacy endpoints may still exist');
});
test('GD3-MANUAL-04 role mutation, deletion, manual grants', async()=>{
  test.skip(true,'Destructive workflows must run on isolated test DB with disposable accounts');
});
test('GD3-MANUAL-05 full learning, content, exam and audit journeys', async()=>{
  test.skip(true,'UI workflows not yet scripted; needs stable selectors and test fixture accounts');
});
