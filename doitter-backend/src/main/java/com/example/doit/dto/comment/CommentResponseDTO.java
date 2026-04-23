package com.example.doit.dto.comment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDTO {

    private Long commentId;

    private String body;

    private Long authorId;

    private String authorName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private boolean isEdited;
}
