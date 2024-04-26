//TODO Remove

export const subject = "Change email verification"

export const plainText = (otp: string, locale: string) => {
  const en = `Change email verification

Hello,

You have requested to change your email address. Please use the following code to validate your request.

Code: ${otp}

If you did not request this change, please ignore this email.
`

  const fr = `Vérification de changement d'email

Bonjour,

Vous avez demandé à changer votre adresse email. Veuillez utiliser le code suivant pour valider votre demande.

Code: ${otp}

Si vous n'avez pas demandé ce changement, veuillez ignorer cet email.
`

  if (locale === "fr") return fr
  return en
}

export const html = (otp: string, locale: string) => `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="${locale}">

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
        }

        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
        }

        p {
            line-height: inherit
        }

        .desktop_hide,
        .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
        }

        .image_block img+div {
            display: none;
        }

        @media (max-width:700px) {
            .desktop_hide table.icons-inner {
                display: inline-block !important;
            }

            .icons-inner {
                text-align: center;
            }

            .icons-inner td {
                margin: 0 auto;
            }

            .mobile_hide {
                display: none;
            }

            .row-content {
                width: 100% !important;
            }

            .stack .column {
                width: 100%;
                display: block;
            }

            .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
            }

            .desktop_hide,
            .desktop_hide table {
                display: table !important;
                max-height: none !important;
            }
        }
    </style>
</head>

<body style="background-color: #E2EFF1; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #E2EFF1;">
        <tbody>
            <tr>
                <td>
                    <div style="height: 100px;"></div>
                    <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                        role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0"
                                        cellspacing="0" role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000; width: 680px; margin: 0 auto; border-radius: 1rem 1rem 0 0;"
                                        width="680">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1"
                                                        style="height:35px;line-height:35px;font-size:1px;">&#8202;
                                                    </div>
                                                    <table class="heading_block block-2" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad" style="text-align:center;width:100%;">
                                                                <h1
                                                                    style="margin: 0; color: #101010; direction: ltr; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 20px; font-weight: normal; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;">
                                                                    <strong>
                                                                    ${
                                                                      locale === "fr"
                                                                        ? "Valider le changement d'email"
                                                                        : "Validate Email Change"
                                                                    }
                                                                    </strong>
                                                                </h1>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                        role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0"
                                        cellspacing="0" role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000; width: 680px; margin: 0 auto; border-radius: 0 0 1rem 1rem;"
                                        width="680">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="16.666666666666668%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1"
                                                        style="height:0px;line-height:0px;font-size:1px;">&#8202;</div>
                                                </td>
                                                <td class="column column-2" width="66.66666666666667%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <table class="paragraph_block block-1" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad"
                                                            style="padding-bottom:10px;padding-left:20px;padding-right:10px;padding-top:10px;">
                                                                <div
                                                                    style="color:#848484;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:16px;line-height:180%;text-align:center;mso-line-height-alt:25.2px;">
                                                                    ${
                                                                      locale === "fr"
                                                                        ? "Vous avez demandé à changer votre adresse email. Veuillez utiliser le code suivant pour valider votre demande."
                                                                        : "You have requested to change your email address. Please use the following code to validate your request."
                                                                    }
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="pad"
                                                                style="padding-bottom:10px;padding-left:20px;padding-right:10px;padding-top:10px;">
                                                                <div
                                                                    style="width:max-content;margin:auto;padding:.5rem 1rem;border-radius:1rem;background:#EAEAEA;color:#121212;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:36px;line-height:180%;text-align:center;mso-line-height-alt:25.2px;">
                                                                    <code>${otp}</code>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <div class="spacer_block block-4"
                                                        style="height:20px;line-height:20px;font-size:1px;">&#8202;
                                                    </div>
                                                </td>
                                                <td class="column column-3" width="16.666666666666668%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1"
                                                        style="height:0px;line-height:0px;font-size:1px;">&#8202;</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="height: 100px;"></div>
                </td>
            </tr>
        </tbody>
    </table><!-- End -->
</body>

</html>`
