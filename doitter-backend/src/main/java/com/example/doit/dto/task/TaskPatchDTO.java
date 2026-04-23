package com.example.doit.dto.task;

import com.example.doit.domain.task.TaskState;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskPatchDTO {

    @NotNull(message = "태스크 ID는 필수입니다.")
    private Long taskId;

    @NotNull(message = "태스크 상태는 필수입니다.")
    private TaskState state;

    @NotNull(message = "태스크 순서는 필수입니다.")
    private int orderIndex;
}
