package com.ficfury.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.net.MalformedURLException;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String storeFile(MultipartFile file) throws IOException {
        validateFile(file);


        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalName =
                StringUtils.cleanPath(file.getOriginalFilename());

        String extension = "";

        int dotIndex = originalName.lastIndexOf(".");

        if (dotIndex > 0) {
            extension = originalName.substring(dotIndex);
        }

        String uniqueFileName =
                UUID.randomUUID().toString() + extension;

        Path target =
                uploadPath.resolve(uniqueFileName);

        Files.copy(
                file.getInputStream(),
                target,
                StandardCopyOption.REPLACE_EXISTING
        );

        return uniqueFileName;
    }
    public void deleteFile(String fileName) {

    try {

        Path file =
                Paths.get(uploadDir)
                        .resolve(fileName);

        Files.deleteIfExists(file);

    }

    catch (IOException e) {

        e.printStackTrace();

    }

}
private void validateFile(MultipartFile file) {

    String name =
            file.getOriginalFilename().toLowerCase();

    if (!(name.endsWith(".pdf")
            || name.endsWith(".doc")
            || name.endsWith(".docx")
            || name.endsWith(".ppt")
            || name.endsWith(".pptx")
            || name.endsWith(".png")
            || name.endsWith(".jpg")
            || name.endsWith(".jpeg"))) {

        throw new RuntimeException(
                "Unsupported file type."
        );
    }

}

public Resource loadFileAsResource(String fileName) {

    try {

        Path filePath = Paths.get(uploadDir)
                .resolve(fileName)
                .normalize();

        Resource resource =
                new UrlResource(filePath.toUri());

        if (resource.exists()) {
            return resource;
        }

        throw new RuntimeException("File not found.");

    }

    catch (MalformedURLException e) {

        throw new RuntimeException(
                "File not found.",
                e
        );

    }

}

}