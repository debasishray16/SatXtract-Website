import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { lat, lon, zoom } = await request.json();

  try {

    const backendURL = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await axios.post(`${backendURL}/api/mapdata`, {
      lat,
      lon,
      zoom,
    });

    return NextResponse.json({ message: 'Data sent successfully', data: response.data });
  } catch (error) {
    return NextResponse.json({ message: 'Error sending data', error: error.message }, { status: 500 });
  }
}