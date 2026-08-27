package com.ficfury.service;

import com.ficfury.model.Certificate;

import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;

import org.springframework.core.io.ClassPathResource;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

import java.awt.Color;

@Service
public class CertificatePdfServiceImpl
        implements CertificatePdfService {

    @Value("${ficfury.certificates.directory:certificates}")
    private String certificatesDirectory;


    @Override
    public String generateCertificatePdf(
            Certificate certificate
    ) throws IOException {

        /*
         * Create certificate directory
         */

        File directory =
                new File(
                        certificatesDirectory
                );

        if (!directory.exists()) {

            if (!directory.mkdirs()) {

                throw new IOException(
                        "Unable to create certificate directory."
                );
            }
        }


        /*
         * File name
         */

        String fileName =
                certificate
                        .getCertificateNumber()
                        + ".pdf";


        File outputFile =
                new File(
                        directory,
                        fileName
                );


/*
 * Create PDF
 */
Document document =
        new Document(
                PageSize.A4.rotate(),
                0,
                0,
                0,
                0
        );

PdfWriter writer =
        PdfWriter.getInstance(
                document,
                new FileOutputStream(outputFile)
        );

document.open();


/*
 * =====================================================
 * FIC FURY CERTIFICATE TEMPLATE
 * =====================================================
 */

ClassPathResource templateResource =
        new ClassPathResource(
                "certificates/fic-fury-certificate-template.png"
        );


Image template =
        Image.getInstance(
                templateResource.getURL()
        );


template.scaleAbsolute(
        PageSize.A4.rotate().getWidth(),
        PageSize.A4.rotate().getHeight()
);


template.setAbsolutePosition(
        0,
        0
);


document.add(template);


/*
 * =====================================================
 * DYNAMIC TEXT
 * =====================================================
 */

PdfContentByte canvas =
        writer.getDirectContent();

BaseFont boldFont =
        BaseFont.createFont(
                BaseFont.HELVETICA_BOLD,
                BaseFont.WINANSI,
                BaseFont.NOT_EMBEDDED
        );

float pageWidth =
        PageSize.A4.rotate().getWidth();


/*
 * =====================================================
 * AWARD
 * =====================================================
 *
 * White text centered inside the red banner.
 */

canvas.setColorFill(Color.WHITE);

drawCenteredText(
        canvas,
        boldFont,
        formatCertificateType(
                certificate.getCertificateType()
        ),
        pageWidth / 2,
        321,
        17
);


/*
 * =====================================================
 * RECIPIENT
 * =====================================================
 */

canvas.setColorFill(
        new Color(
                31,
                79,
                145
        )
);

drawCenteredText(
        canvas,
        boldFont,
        certificate.getRecipientName(),
        pageWidth / 2,
        257,
        25
);


/*
 * =====================================================
 * CHARACTER
 * =====================================================
 *
 * Character appears to the right of CHARACTER:
 */

drawText(
        canvas,
        boldFont,
        certificate.getCharacterName(),
        455,
        213,
        11
);


/*
 * =====================================================
 * PARTICIPATION TEXT
 * =====================================================
 *
 * The static PNG already contains:
 *
 * FOR OUTSTANDING PARTICIPATION IN
 *
 * Therefore we only draw the dynamic lines beneath it.
 */


/*
 * =====================================================
 * COMMITTEE
 * =====================================================
 *
 * Preview order:
 *
 * Committee
 * Event
 */

canvas.setColorFill(
        new Color(
                31,
                79,
                145
        )
);

drawCenteredText(
        canvas,
        boldFont,
        certificate.getCommitteeName(),
        pageWidth / 2,
        151,
        14
);


/*
 * =====================================================
 * EVENT
 * =====================================================
 */

canvas.setColorFill(
        new Color(
                200,
                50,
                50
        )
);

drawCenteredText(
        canvas,
        boldFont,
        certificate.getEventName(),
        pageWidth / 2,
        128,
        16
);


/*
 * =====================================================
 * CHAIRPERSON
 * =====================================================
 *
 * The Certificate entity currently does not expose
 * a chairperson name, so this is intentionally left
 * out until the value is supplied by the backend.
 *
 * The static template already contains:
 *
 * CHAIRPERSON
 *
 * The name should eventually be drawn immediately
 * above that label.
 */


/*
 * =====================================================
 * CERTIFICATE NUMBER
 * =====================================================
 */

canvas.setColorFill(
        new Color(
                31,
                79,
                145
        )
);

drawText(
        canvas,
        boldFont,
        certificate.getCertificateNumber(),
        -230,
        43,
        8
);


/*
 * =====================================================
 * DATE
 * =====================================================
 */

String issuedDate =
        certificate
                .getIssuedAt()
                .format(
                        DateTimeFormatter.ofPattern(
                                "dd MMMM yyyy"
                        )
                );

drawText(
        canvas,
        boldFont,
        "DATE: " + issuedDate,
        pageWidth - 170,
        43,
        8
);

document.close();

    /*
     * Return path
     */

    return outputFile.getAbsolutePath();



}

private void drawCenteredText(
        PdfContentByte canvas,
        BaseFont font,
        String text,
        float x,
        float y,
        float fontSize
) {

    if (text == null || text.isBlank()) {
        return;
    }

    canvas.beginText();

    canvas.setFontAndSize(
            font,
            fontSize
    );

    canvas.showTextAligned(
            Element.ALIGN_CENTER,
            text,
            x,
            y,
            0
    );

    canvas.endText();
}


private void drawText(
        PdfContentByte canvas,
        BaseFont font,
        String text,
        float x,
        float y,
        float fontSize
) {

    if (text == null || text.isBlank()) {
        return;
    }

    canvas.beginText();

    canvas.setFontAndSize(
            font,
            fontSize
    );

    canvas.setTextMatrix(
            x,
            y
    );

    canvas.showText(
            text
    );

    canvas.endText();
}
    private String formatCertificateType(
            Object type
    ) {

        if (type == null) {
            return "CERTIFICATE OF PARTICIPATION";
        }


        String value =
                type.toString()
                        .replace(
                                "_",
                                " "
                        );


        return value.toUpperCase();
    }
}