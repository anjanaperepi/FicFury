package com.ficfury.service;

import com.ficfury.model.Certificate;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

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
                        45,
                        45,
                        45,
                        45
                );


        try {

            PdfWriter.getInstance(
                    document,
                    new FileOutputStream(
                            outputFile
                    )
            );


            document.open();


            /*
             * TITLE
             */

            Paragraph logo =
                    new Paragraph(
                            "FIC FURY",
                            FontFactory.getFont(
                                    FontFactory.HELVETICA,
                                    26,
                                    Font.BOLD
                            )
                    );

            logo.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(logo);


            Paragraph subtitle =
                    new Paragraph(
                            "FICTION FURY",
                            FontFactory.getFont(
                                    FontFactory.HELVETICA,
                                    11,
                                    Font.NORMAL
                            )
                    );

            subtitle.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(subtitle);


            document.add(
                    new Paragraph(" ")
            );


            /*
             * CERTIFICATE
             */

            Paragraph certificateTitle =
                    new Paragraph(
                            "CERTIFICATE",
                            FontFactory.getFont(
                                    FontFactory.HELVETICA,
                                    34,
                                    Font.BOLD
                            )
                    );

            certificateTitle.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(
                    certificateTitle
            );


            Paragraph type =
                    new Paragraph(
                            formatCertificateType(
                                    certificate
                                            .getCertificateType()
                            ),
                            FontFactory.getFont(
                                    FontFactory.HELVETICA,
                                    16,
                                    Font.BOLD
                            )
                    );

            type.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(type);


            document.add(
                    new Paragraph(" ")
            );


            /*
             * RECIPIENT
             */

            Paragraph presented =
                    new Paragraph(
                            "This certificate is proudly presented to",
                            FontFactory.getFont(
                                    FontFactory.HELVETICA,
                                    12
                            )
                    );

            presented.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(
                    presented
            );


            Paragraph recipient =
                    new Paragraph(
                            certificate
                                    .getRecipientName(),
                            FontFactory.getFont(
                                    FontFactory.HELVETICA,
                                    28,
                                    Font.BOLD
                            )
                    );

            recipient.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(
                    recipient
            );


            if (
                    certificate.getCharacterName()
                            != null
            ) {

                Paragraph character =
                        new Paragraph(
                                certificate
                                        .getCharacterName(),
                                FontFactory.getFont(
                                        FontFactory.HELVETICA,
                                        14,
                                        Font.ITALIC
                                )
                        );

                character.setAlignment(
                        Element.ALIGN_CENTER
                );

                document.add(
                        character
                );
            }


            document.add(
                    new Paragraph(" ")
            );


            /*
             * EVENT
             */

            Paragraph event =
                    new Paragraph(
                            "for outstanding participation in",
                            FontFactory.getFont(
                                    FontFactory.HELVETICA,
                                    11
                            )
                    );

            event.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(event);


            Paragraph eventName =
                    new Paragraph(
                            certificate
                                    .getEventName(),
                            FontFactory.getFont(
                                    FontFactory.HELVETICA,
                                    18,
                                    Font.BOLD
                            )
                    );

            eventName.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(
                    eventName
            );


            Paragraph committee =
                    new Paragraph(
                            certificate
                                    .getCommitteeName(),
                            FontFactory.getFont(
                                    FontFactory.HELVETICA,
                                    14
                            )
                    );

            committee.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(
                    committee
            );


            document.add(
                    new Paragraph(" ")
            );

            document.add(
                    new Paragraph(" ")
            );


            /*
             * DATE
             */

            String issuedDate =
                    certificate
                            .getIssuedAt()
                            .format(
                                    DateTimeFormatter.ofPattern(
                                            "dd MMMM yyyy"
                                    )
                            );


            Paragraph date =
                    new Paragraph(
                            "Issued: "
                                    + issuedDate,
                            FontFactory.getFont(
                                    FontFactory.HELVETICA,
                                    10
                            )
                    );

            date.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(date);


            /*
             * CERTIFICATE NUMBER
             */

            Paragraph number =
                    new Paragraph(
                            "Certificate No. "
                                    + certificate
                                            .getCertificateNumber(),
                            FontFactory.getFont(
                                    FontFactory.HELVETICA,
                                    9
                            )
                    );

            number.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(number);


        } finally {

            document.close();
        }


        /*
         * Return path
         */

        return outputFile.getAbsolutePath();
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