export const subject = "Need help"

export const plainText = (locale: string) => {
  if (locale === "fr") {
    return "Votre message a bien été envoyé au support"
  }

  return "Your message has successfully been sent to the support"
}

export const html = (locale: string) => `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="fr">

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

<body style="background-color: #ECF8FA; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ECF8FA; padding-left: 12px; padding-right: 12px;">
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
                                                                    style="margin: 0; color: #101010; direction: ltr; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 18px; font-weight: normal; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;">
                                                                    ${
                                                                      locale === "fr"
                                                                        ? "Votre message a bien été envoyé au support"
                                                                        : "Your message has successfully been sent to the support"
                                                                    }
                                                                </h1>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <div class="spacer_block block-1" style="height:35px;line-height:35px;font-size:1px;"> 
                                                    </div>
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
