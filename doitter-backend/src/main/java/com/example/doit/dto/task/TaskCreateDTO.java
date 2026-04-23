package com.example.doit.dto.task;

import com.example.doit.domain.task.TaskPriority;
import com.example.doit.domain.task.TaskState;
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
@NoArgsConstructor
@AllArgsConstructor
public class TaskCreateDTO {

    @NotBlank(message = "태스크 제목은 필수입니다.")
    private String title;

    @NotNull(message = "태스크 마감일은 필수입니다.")
    @FutureOrPresent(message = "마감일은 미래일자여야 합니다.")
    private LocalDateTime dueDate;

    private String description;

    private TaskState state;

    private int orderIndex;

    @NotNull(message = "태스크 우선순위는 필수입니다.")
    private TaskPriority priority;

    @NotNull(message = "태스크 담당자는 필수입니다.")
    private Long userId;
}

