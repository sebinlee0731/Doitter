package com.example.doit.dto.project;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberAddDTO {

    @NotNull(message = "프로젝트에 추가할 사용자아이디는 필수입니다.")
    private Long memberId;
}
