package com.example.OceanEyes.Service;
import com.mongodb.client.gridfs.model.GridFSFile;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

//To store files in mongoDB
// Since mongoDB stores images as bytes[], using GridFS collection

@Service
public class FileService {
    @Autowired
    private GridFsTemplate gridFsTemplate;

    @Autowired
    private GridFsOperations gridFsOperations;

    public String saveFile(MultipartFile file) throws IOException {
        return gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(),file.getContentType()).toString();
    }

    public Optional<GridFsResource> getFile(String fileId) {
        GridFSFile gridFSFile = gridFsTemplate.findOne(query(where("_id").is(fileId)));
        if (gridFSFile == null) {
            return Optional.empty();
        }
        return Optional.of(gridFsOperations.getResource(gridFSFile));
    }
}
