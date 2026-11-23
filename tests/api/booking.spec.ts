import { test, expect, APIRequestContext } from '@playwright/test';

async function createBooking(request: APIRequestContext) {
  const res = await request.post('/booking', {
    data: {
      firstname: 'Ben',
      lastname: 'Tester',
      totalprice: 150,
      depositpaid: true,
      bookingdates: { checkin: '2026-12-01', checkout: '2026-12-05' },
      additionalneeds: 'Breakfast',
    },
    headers: { Accept: 'application/json' },
  });
  expect(res.status()).toBe(200);
  return (await res.json()).bookingid as number;
}

test.describe('Booking API', () => {
  test('GET a booking returns its details', async ({ request }) => {
    // The sandbox is shared, so find a real ID instead of hard-coding one
    const listRes = await request.get('/booking');
    expect(listRes.status()).toBe(200);
    const list = await listRes.json();
    expect(list.length).toBeGreaterThan(0);
    const id = list[0].bookingid;

    const res = await request.get(`/booking/${id}`);
    expect(res.status()).toBe(200);
    const booking = await res.json();
    expect(booking).toHaveProperty('firstname');
    expect(booking).toHaveProperty('lastname');
    expect(booking).toHaveProperty('bookingdates.checkin');
  });

  test('POST creates a booking that can be read back', async ({ request }) => {
    const newBooking = {
      firstname: 'Ben',
      lastname: 'Tester',
      totalprice: 150,
      depositpaid: true,
      bookingdates: { checkin: '2026-12-01', checkout: '2026-12-05' },
      additionalneeds: 'Breakfast',
    };

    const createRes = await request.post('/booking', {
      data: newBooking,
      headers: { Accept: 'application/json' },
    });
    expect(createRes.status()).toBe(200);
    const created = await createRes.json();
    expect(created.bookingid).toBeTruthy();
    expect(created.booking).toEqual(newBooking);

    const getRes = await request.get(`/booking/${created.bookingid}`);
    expect(getRes.status()).toBe(200);
    expect(await getRes.json()).toEqual(newBooking);
  });

  test('PUT with a valid token updates the booking', async ({ request }) => {
    const id = await createBooking(request);

    const authRes = await request.post('/auth', {
      data: { username: 'admin', password: 'password123' },
    });
    expect(authRes.status()).toBe(200);
    const { token } = await authRes.json();
    expect(token).toBeTruthy();

    const updated = {
      firstname: 'Ben',
      lastname: 'Updated',
      totalprice: 200,
      depositpaid: false,
      bookingdates: { checkin: '2026-12-02', checkout: '2026-12-06' },
      additionalneeds: 'Late checkout',
    };

    const putRes = await request.put(`/booking/${id}`, {
      data: updated,
      headers: { Accept: 'application/json', Cookie: `token=${token}` },
    });
    expect(putRes.status()).toBe(200);
    expect(await putRes.json()).toEqual(updated);
  });

  test('PUT without a token is rejected', async ({ request }) => {
    const id = await createBooking(request);

    const putRes = await request.put(`/booking/${id}`, {
      data: { firstname: 'Hacker' },
      headers: { Accept: 'application/json' },
    });
    expect(putRes.status()).toBe(403);
  });
});