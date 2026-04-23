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
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDTO {

    private Long taskId;

    private String title;

    private TaskState state;

    private int orderIndex;

    private TaskPriority priority;

    private LocalDateTime dueDate;

    private String userName;

    @Builder.Default
    private List<LabelResponseDTO> labels =  new ArrayList<>();

}
