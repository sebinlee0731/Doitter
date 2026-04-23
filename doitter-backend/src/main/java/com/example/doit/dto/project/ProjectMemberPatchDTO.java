package com.example.doit.dto.project;

import com.example.doit.domain.project.ProjectRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberPatchDTO {

    @NotNull(message = "프로젝트 사용자의 역할은 필수입니다.")
    private ProjectRole role;
}
