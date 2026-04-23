package com.example.doit.dto.task;

import com.example.doit.domain.task.TaskPriority;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskUpdateDTO {

    @NotBlank(message = "태스크 제목은 필수입니다.")
    private String title;

    private String description;

    @NotNull(message = "담당자 ID는 필수입니다.")
    private Long userId;

    @NotNull(message = "태스크 마감일은 필수입니다.")
    @FutureOrPresent(message = "마감일은 미래일자여야 합니다.")
    private LocalDateTime dueDate;

    @NotNull(message = "태스크 우선순위는 필수입니다.")
    private TaskPriority priority;
}
