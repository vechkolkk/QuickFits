import jwt from 'jsonwebtoken';

export function createToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}
