package com.example.doit.dto.label;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LabelCreateDTO {

    @NotBlank(message = "라벨 이름은 필수입니다.")
    private String name;

    @NotBlank(message = "라벨 색상은 필수입니다.")
    private String color;
}
