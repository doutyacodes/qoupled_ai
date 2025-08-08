import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export const authenticate = async (req) => {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return { authenticated: false, response: NextResponse.json({ error: 'No token provided' }, { status: 401 }) };
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return { authenticated: false, response: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
    }
    return { authenticated: true, decoded_Data: decoded };
  } catch (error) {
    return { authenticated: false, response: NextResponse.json({ error: 'Authentication failed' }, { status: 500 }) };
  }
};
