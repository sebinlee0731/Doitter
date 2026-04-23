package com.example.doit.dto.project;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class ProjectCreateDto {
    private Long id;
    private String name;
    private String description;
    private String visibility;
    private String status;


}
