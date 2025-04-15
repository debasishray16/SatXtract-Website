import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { model } = await request.json(); // Extract the model from the request body

  try {
    console.log(`Forwarding model to backend: ${model}`);
    // Forward the model data to the backend server
    const backendURL = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await axios.post(`${backendURL}/api/runModel`, {
      model,
    });

    console.log('Response from Flask backend:', response.data);

    return NextResponse.json({
      message: 'Model sent successfully',
      data: response.data,
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error sending model data', error: error.message },
      { status: 500 }
    );
  }
}