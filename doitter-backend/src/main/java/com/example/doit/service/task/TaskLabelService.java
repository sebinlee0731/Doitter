package com.example.doit.service.task;

import com.example.doit.domain.label.Label;
import com.example.doit.domain.task.Task;
import com.example.doit.domain.task.TaskLabel;
import com.example.doit.domain.task.TaskLabelId;
import com.example.doit.dto.label.LabelIdRequestDTO;
import com.example.doit.repository.label.LabelRepository;
import com.example.doit.repository.task.TaskLabelRepository;
import com.example.doit.repository.task.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class TaskLabelService {

    private final TaskRepository taskRepository;
    private final LabelRepository labelRepository;
    private final TaskLabelRepository taskLabelRepository;

    public List<TaskLabelId> setLabel(Long taskId, LabelIdRequestDTO labelIdRequestDTO) {

        // 추가로 개선한다면, task가 project에 소속되는게 확실한지 검증

        List<Long> labelIdList = labelIdRequestDTO.getLabelIds();

        // 저장할 라벨이 없을 경우 빈배열 반환
        if (labelIdList == null || labelIdList.isEmpty()) {
            return List.of();
        }

        // [조회]
        Task task = taskRepository.findById(taskId)
                .orElseThrow(EntityNotFoundException::new);

        List<Label> existingLabels = labelRepository.findAllById(labelIdList);

        // 요청 라벨이 DB에 존재 하지 않을 경우
        if (existingLabels.size() != labelIdList.size()) {
            throw new EntityNotFoundException();
        }

        // [실행]
        List<TaskLabel> newConnections = existingLabels.stream()
                .map(label -> {
                    return TaskLabel.builder()
                            .task(task)
                            .label(label)
                            .build();
                }).toList();

        taskLabelRepository.deleteByTaskId(taskId);

        List<TaskLabel> savedConnections = taskLabelRepository.saveAll(newConnections);

        return savedConnections.stream()
                .map(TaskLabel::getId)
                .toList();
    }
}
