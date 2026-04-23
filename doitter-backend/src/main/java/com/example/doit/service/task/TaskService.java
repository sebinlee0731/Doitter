package com.example.doit.service.task;

import com.example.doit.domain.label.Label;
import com.example.doit.domain.project.Project;
import com.example.doit.domain.project.ProjectRole;
import com.example.doit.domain.task.Task;
import com.example.doit.domain.task.TaskLabel;
import com.example.doit.domain.user.User;
import com.example.doit.dto.label.LabelResponseDTO;
import com.example.doit.dto.task.*;
import com.example.doit.repository.project.ProjectMemberRepository;
import com.example.doit.repository.project.ProjectRepository;
import com.example.doit.repository.task.TaskLabelRepository;
import com.example.doit.repository.task.TaskRepository;
import com.example.doit.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskLabelRepository taskLabelRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public Long create(Long projectId, TaskCreateDTO taskCreateDTO) {

        // [조회] project은 인가 단계에서 실체 확인
        Project projectReference = projectRepository.getReferenceById(projectId);

        User user = userRepository.findById(taskCreateDTO.getUserId())
                .orElseThrow(EntityNotFoundException::new);

        // [실행] 상태(DOTO, DOING DONE) 중에서 가장 큰 OrderIndex 반환
        int maxIndex = taskRepository.findMaxOrderIndex(projectId, taskCreateDTO.getState())
                .orElse(0);

        taskCreateDTO.setOrderIndex(maxIndex + 1);

        Task task = toDomain(taskCreateDTO, projectReference, user);

        return taskRepository.save(task).getId();
    }

    public Long update(Long loggedInUserId, Long taskId, TaskUpdateDTO taskUpdateDTO) {

        // [조회]
        User newAssignee = userRepository.findById(taskUpdateDTO.getUserId())
                .orElseThrow(EntityNotFoundException::new);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(EntityNotFoundException::new);

        // [검증] ADMIN 이거나, Assignee 이거나
        boolean isAdmin = isAdmin(task.getProject().getId(), loggedInUserId);
        boolean isAssignee = task.getUser().getId().equals(loggedInUserId);

        if (!isAdmin && !isAssignee) {
            throw new AccessDeniedException("이 태스크를 수정할 권한이 없습니다.");
        }

        // [실행]
        task.changeTitle(taskUpdateDTO.getTitle());
        task.changeDueDate(taskUpdateDTO.getDueDate());
        task.changeDescription(taskUpdateDTO.getDescription());
        task.changePriority(taskUpdateDTO.getPriority());
        task.changeUser(newAssignee);

        return task.getId();
    }

    public void delete(Long loggedInUserId, Long taskId) {

        // [조회]
        Task task = taskRepository.findById(taskId)
                .orElseThrow(EntityNotFoundException::new);

        // [검증]
        boolean isAdmin = isAdmin(task.getProject().getId(), loggedInUserId);
        boolean isAssignee = task.getUser().getId().equals(loggedInUserId);

        if (!isAdmin && !isAssignee) {
            throw new AccessDeniedException("권한이 없습니다.");
        }

        // [실행]
        taskRepository.delete(task);
    }

    public Page<TaskResponseDTO> readPage(Long projectId, Pageable pageable) {

        // [조회]
        Page<Task> taskPage = taskRepository.readPage(projectId, pageable);

        List<Long> taskIdList = taskPage.getContent().stream().map(Task::getId).toList();

        List<TaskLabel> taskLabelList = taskLabelRepository.findByTaskIdList(taskIdList);

        // [실행]
        Map<Long, List<LabelResponseDTO>> labelsMap = taskLabelList.stream()
                .collect(Collectors.groupingBy(
                        // Key: TaskId
                        taskLabel -> taskLabel.getTask().getId(),

                        // Value: List<LabelResponseDTO>
                        Collectors.mapping(
                                // TaskLabel -> Label -> LabelResponseDTO (수동 변환)
                                taskLabel -> {
                                    Label label = taskLabel.getLabel();
                                    return LabelResponseDTO.builder()
                                            .labelId(label.getId()) // (Label의 PK가 'id'라고 가정)
                                            .name(label.getName())
                                            .color(label.getColor())
                                            .build();
                                },
                                Collectors.toList()
                        )
                ));

        //  [최종 조립] Page<Task>를 Page<TaskResponseDTO>로 변환
        return taskPage.map(task -> {

            // Task의 Label 리스트를 (DB 접근 없이) 가져옵니다.
            List<LabelResponseDTO> labels = labelsMap.getOrDefault(task.getId(), List.of());

            // Task 엔티티와 조회된 정보들로 DTO를 빌드합니다.
            return TaskResponseDTO.builder()
                    .taskId(task.getId())
                    .title(task.getTitle())
                    .state(task.getState())
                    .orderIndex(task.getOrderIndex())
                    .priority(task.getPriority())
                    .dueDate(task.getDueDate())
                    .userName(task.getUser().getName())
                    .labels(labels) // [핵심] 조립된 라벨 리스트 주입
                    .build();
        });
    }

    public void patchState(List<TaskPatchDTO> taskPatchDTOList) {

        // [조회]
        List<Long> taskIdList = taskPatchDTOList.stream().map(TaskPatchDTO::getTaskId).toList();
        List<Task> taskList = taskRepository.findAllById(taskIdList);

        // [실행]
        Map<Long, Task> taskMap = taskList.stream().collect(Collectors.toMap(Task::getId, task -> task));

        for (TaskPatchDTO dto : taskPatchDTOList) {

            Task task = taskMap.get(dto.getTaskId());

            if (task != null) {
                task.changeState(dto.getState());
                task.changeOrderIndex(dto.getOrderIndex());
            } else {
                throw new EntityNotFoundException();
            }
        }
    }

    public TaskDetailResponseDTO getTaskWithLabels(Long taskId) {

        // [조회]
        Task task = taskRepository.findById(taskId)
                .orElseThrow(EntityNotFoundException::new);

        List<TaskLabel> TaskLabelList = taskLabelRepository.findListByTaskId(taskId);

        // [실행]
        List<LabelResponseDTO> labelResponseDTOList = TaskLabelList.stream()
                .map(taskLabel -> LabelResponseDTO.builder()
                        .labelId(taskLabel.getLabel().getId())
                        .color(taskLabel.getLabel().getColor())
                        .name(taskLabel.getLabel().getName())
                        .build()).toList();

        return toDTO(task, labelResponseDTOList);
    }

    private Task toDomain(TaskCreateDTO taskCreateDTO, Project project, User user) {
        return Task.builder()
                .title(taskCreateDTO.getTitle())
                .dueDate(taskCreateDTO.getDueDate())
                .description(taskCreateDTO.getDescription())
                .state(taskCreateDTO.getState())
                .orderIndex(taskCreateDTO.getOrderIndex())
                .priority(taskCreateDTO.getPriority())
                .project(project)
                .user(user)
                .build();
    }

    private TaskDetailResponseDTO toDTO(Task task, List<LabelResponseDTO> LabelResponseDTOList) {
        return TaskDetailResponseDTO.builder()
                .taskId(task.getId())
                .title(task.getTitle())
                .dueDate(task.getDueDate())
                .description(task.getDescription())
                .state(task.getState())
                .priority(task.getPriority())
                .createdAt(task.getCreatedAt())
                .labels(LabelResponseDTOList)
                .build();
    }

    private boolean isAdmin(Long projectId, Long loggedInUserId) {
        ProjectRole myRole = projectMemberRepository.findMyRole(projectId, loggedInUserId)
                .orElse(null);
        return myRole == ProjectRole.ADMIN;
    }

}
