import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { startDate, endDate } = await request.json();

  try {
    const backendURL = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await axios.post(`${backendURL}/api/datedata`, {
      startDate,
      endDate,
    });

    return NextResponse.json({ message: 'Date data sent successfully', data: response.data });
  } catch (error) {
    console.error('Error sending date data:', error.message);
    return NextResponse.json({ message: 'Error sending date data', error: error.message }, { status: 500 });
  }
}