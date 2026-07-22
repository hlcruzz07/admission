<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmation</title>
</head>
<body style="margin:0;padding:40px 20px;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td align="center">

            <table role="presentation"
                   width="600"
                   cellpadding="0"
                   cellspacing="0"
                   style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">

                <!-- Header -->
                <tr>
                    <td align="center"
                        style="background:#EEF9F3;padding:36px 24px;border-bottom:4px solid #2FA084;">

                        <img
                            src="https://chmsu.edu.ph/chmsuwebsite/wp-content/uploads/2022/05/CHMSUWeb.png"
                            alt="CHMSU Logo"
                            width="90"
                            style="display:block;margin-bottom:18px;">

                        <div style="font-size:24px;font-weight:bold;color:#1F6F5F;">
                            Carlos Hilado Memorial State University
                        </div>

                        <div style="margin-top:8px;font-size:14px;color:#2FA084;font-weight:bold;letter-spacing:1px;">
                            ADMISSION APPOINTMENT CONFIRMATION
                        </div>

                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:40px;">

                        <div style="display:inline-block;padding:6px 14px;background:#EEF9F3;border:1px solid #6FCF97;border-radius:999px;color:#1F6F5F;font-size:13px;font-weight:bold;">
                            ✓ Appointment Confirmed
                        </div>

                        <h2 style="margin:24px 0 12px;color:#111827;font-size:24px;">
                            Hello, {{ $studentName }} 👋
                        </h2>

                        <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.8;">
                            Your admission appointment has been
                            <strong style="color:#1F6F5F;">successfully confirmed.</strong>

                            Please keep your confirmation link. You may use it anytime to view or download your appointment confirmation.
                        </p>

                        <!-- Features -->
                        <table role="presentation"
                               width="100%"
                               cellpadding="0"
                               cellspacing="0"
                               style="margin-top:28px;border:1px solid #edf2f7;border-radius:10px;">

                            <tr>
                                <td style="padding:14px 18px;border-bottom:1px solid #edf2f7;font-size:14px;color:#374151;">
                                    📄 View your appointment details
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:14px 18px;border-bottom:1px solid #edf2f7;font-size:14px;color:#374151;">
                                    🖨️ Download or print your confirmation
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:14px 18px;font-size:14px;color:#374151;">
                                    🎓 Present it during your scheduled appointment
                                </td>
                            </tr>

                        </table>

                        <p style="margin:28px 0 12px;color:#4b5563;font-size:15px;line-height:1.8;">
                            The verified applicants will take the CHMSU Admission Test on their reserved dates in their chosen appointment venues. Kindly bring the following:
                        </p>

                        <!-- What to Bring -->
                        <table role="presentation"
                               width="100%"
                               cellpadding="0"
                               cellspacing="0"
                               style="border:1px solid #edf2f7;border-radius:10px;overflow:hidden;">

                            <tr>
                                <td style="padding:12px 18px;background:#fafafa;border-bottom:1px solid #edf2f7;font-size:13px;font-weight:bold;color:#1F6F5F;text-transform:uppercase;letter-spacing:0.5px;">
                                    What to Bring
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;font-size:14px;color:#374151;">
                                    ✅ Senior High School ID or any valid identification card
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;font-size:14px;color:#374151;">
                                    ✅ Learner's Reference Number (for incoming first-year)
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;font-size:14px;color:#374151;">
                                    ✅ Two (2) pieces 2×2 ID picture
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;font-size:14px;color:#374151;">
                                    ✅ Black ballpoint pen, eraser, and pencil
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:12px 18px;border-bottom:1px solid #edf2f7;font-size:14px;color:#374151;">
                                    ✅ Proof of your successful appointment schedule (screenshot or downloadable PDF)
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:12px 18px;font-size:14px;color:#374151;">
                                    ✅ Water bottle to stay hydrated
                                </td>
                            </tr>

                        </table>

                        <!-- Button -->
                        <table role="presentation"
                               cellpadding="0"
                               cellspacing="0"
                               align="center"
                               style="margin:36px auto;">

                            <tr>

                                <td bgcolor="#2FA084"
                                    style="border-radius:8px;">

                                    <a href="{{ $successUrl }}"
                                       style="
                                            display:inline-block;
                                            padding:14px 30px;
                                            color:#ffffff;
                                            font-size:15px;
                                            font-weight:bold;
                                            text-decoration:none;
                                            border-radius:8px;">
                                        View My Confirmation
                                    </a>

                                </td>

                            </tr>

                        </table>

                        <!-- Reminder -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                            style="background:#1F6F5F; border-radius:12px;">
                            <tr>
                                <td style="padding:22px 24px;">

                                    <!-- Badge -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                                        <tr>
                                            <td style="background:#6FCF97; border-radius:999px; padding:5px 12px;">
                                                <span style="font-size:11px; font-weight:bold; letter-spacing:1.5px; color:white; text-transform:uppercase;">
                                                    ⏰&nbsp; Important Reminder
                                                </span>
                                            </td>
                                        </tr>
                                    </table>

                                    <div style="font-size:16px; font-weight:bold; color:#FFFFFF; line-height:1.6; margin-bottom:4px;">
                                        Arrive at least 45 minutes early.
                                    </div>

                                    <div style="font-size:14px; color:#EEEEEE; line-height:1.7;">
                                        Please be at your appointment venue <strong style="color:#FFFFFF;">45 minutes before</strong> the test start time. Late arrivals may not be accommodated.
                                    </div>

                                </td>
                            </tr>
                        </table>

                        <!-- Contact and Support -->
                        <table role="presentation"
                               width="100%"
                               cellpadding="0"
                               cellspacing="0"
                               style="margin-top:20px;border:1px solid #edf2f7;border-radius:10px;">

                            <tr>

                                <td style="padding:18px;">

                                    <div style="font-size:13px;font-weight:bold;color:#1F6F5F;margin-bottom:8px;">
                                        CONTACT AND SUPPORT
                                    </div>

                                    <div style="font-size:14px;color:#374151;line-height:1.8;">
                                        For questions and clarifications, send a message to the CHMSU Compassion Facebook Page. You may also contact the CHMSU Office of the Guidance Services by email at
                                        <a href="mailto:guidance.talisay@chmsu.edu.ph" style="color:#2FA084;text-decoration:none;">guidance.talisay@chmsu.edu.ph</a>
                                        or by phone at (034) 454 0529 / 454 0529 / (034) 454-584, local 136.
                                    </div>

                                </td>

                            </tr>

                        </table>

                    </td>
                </tr>

                <!-- Footer -->
                <tr>

                    <td
                        align="center"
                        style="
                            background:#fafafa;
                            padding:28px;
                            border-top:1px solid #e5e7eb;
                            color:#6b7280;
                            font-size:13px;
                            line-height:1.7;">

                        <strong style="color:#1F6F5F;">
                            Admissions Office
                        </strong>

                        <br>

                        Carlos Hilado Memorial State University

                        <br><br>

                        This is an automated email. Please do not reply.

                    </td>

                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>