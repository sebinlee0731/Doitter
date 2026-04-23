package com.example.doit.dto.task;

import com.example.doit.domain.task.TaskPriority;
import com.example.doit.domain.task.TaskState;
import com.example.doit.dto.label.LabelResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskDetailResponseDTO {

    private Long taskId;

    private String title;

    private String description;

    private TaskState state;

    private TaskPriority priority;

    private LocalDateTime dueDate;

    private LocalDateTime createdAt;

    @Builder.Default
    private List<LabelResponseDTO> labels =  new ArrayList<>();
}
