package com.example.doit.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class ProjectResponseDto {
    private Long id;
    private String name;
    private String description;
    private String visibility;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
