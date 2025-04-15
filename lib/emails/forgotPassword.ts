import config from "../config";
import { VERIFICATION_TOKEN_EXP_MIN } from "../constants";



export const sendForgotPasswordEmail = (token: string) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="text-align: center; color: #eab308;">Authy</h2>

      <p>Hi there,</p>

      <p>Please use the link below to access the reset password form on Authy. This link will expire in ${VERIFICATION_TOKEN_EXP_MIN} minutes. If you don't think you should be receiving this email, you can safely ignore it.</p>

      <p style="text-align: center;">
        <a href="${config.env.prodApiEndpoint}/auth/sign-in/forgot-password?token=${token}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #eab308; text-decoration: none; border-radius: 5px;">Reset Password Form</a>
      </p>
      
      <br />

      <p>You received this email because you send a forgot password request for Authy.</p>

      <p style="text-align: center; font-size: 12px; color: #aaa;">&copy; 2024 Authy. All rights reserved.</p>
    </div>
  `;
}; 
