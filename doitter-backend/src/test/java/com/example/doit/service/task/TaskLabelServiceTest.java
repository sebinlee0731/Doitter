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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class) // 1. Mockito 사용
class TaskLabelServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private LabelRepository labelRepository;
    @Mock
    private TaskLabelRepository taskLabelRepository;

    @InjectMocks // 2. Mock들을 Service에 주입
    private TaskLabelService taskLabelService;

    // --- 테스트용 공통 더미 데이터 ---
    private Task mockTask;
    private Label mockLabel1;
    private Label mockLabel2;
    private final Long taskId = 1L;
    private final Long labelId1 = 10L;
    private final Long labelId2 = 11L;

    @BeforeEach
    void setUp() {
        // 'Task 1' 생성
        mockTask = Task.builder().build();
        ReflectionTestUtils.setField(mockTask, "id", taskId);

        // 'Label 1' (Bug) 생성
        mockLabel1 = Label.builder().name("Bug").build();
        ReflectionTestUtils.setField(mockLabel1, "id", labelId1);

        // 'Label 2' (Feature) 생성
        mockLabel2 = Label.builder().name("Feature").build();
        ReflectionTestUtils.setField(mockLabel2, "id", labelId2);
    }

    @Test
    @DisplayName("setLabel: 태스크의 라벨을 성공적으로 (교체)설정한다")
    void testSetLabelSuccess() {
        // Given (준비)
        // 1. DTO는 라벨 2개를 요청
        LabelIdRequestDTO dto = new LabelIdRequestDTO();
        ReflectionTestUtils.setField(dto, "labelIds", List.of(labelId1, labelId2));

        // 2. [Mocking] 'Task'는 존재함
        given(taskRepository.findById(taskId)).willReturn(Optional.of(mockTask));

        // 3. [Mocking] 'Label' 2개 모두 존재함
        given(labelRepository.findAllById(List.of(labelId1, labelId2))).willReturn(List.of(mockLabel1, mockLabel2));

        // 4. [Mocking] 'saveAll'이 호출되면, TaskLabel 2개를 반환하도록 '가정'
        // (ID는 @MapsId가 채우므로 null로 두어도 됨)
        TaskLabel tl1 = TaskLabel.builder().task(mockTask).label(mockLabel1).build();
        TaskLabel tl2 = TaskLabel.builder().task(mockTask).label(mockLabel2).build();
        given(taskLabelRepository.saveAll(anyList())).willReturn(List.of(tl1, tl2));

        // When (실행)
        List<TaskLabelId> resultIds = taskLabelService.setLabel(taskId, dto);

        // Then (검증)
        // 5. [검증] 'deleteByTaskId'가 1번 호출되었는지 (기존 값 삭제)
        verify(taskLabelRepository).deleteByTaskId(taskId);

        // 6. [검증] 'saveAll'이 1번 호출되었는지 (새 값 추가)
        verify(taskLabelRepository).saveAll(anyList());

        // 7. [검증] 반환된 ID 리스트의 개수가 2개인지
        assertThat(resultIds).hasSize(2);
    }

    @Test
    @DisplayName("setLabel: DTO의 라벨 리스트가 '비어있으면' 404/삭제 로직 없이 빈 리스트를 반환한다")
    void setLabel_Success_WhenListIsEmpty() {
        // Given (준비)
        // 1. DTO는 '빈' 리스트를 요청
        LabelIdRequestDTO dto = new LabelIdRequestDTO();
        ReflectionTestUtils.setField(dto, "labelIds", List.of()); // ⭐️ 빈 리스트

        // When (실행)
        List<TaskLabelId> resultIds = taskLabelService.setLabel(taskId, dto);

        // Then (검증)
        // 2. ⭐️ [검증] (현재 로직상) 'findById', 'deleteByTaskId' 등 어떤 Repository도 호출되면 안 됨
        verify(taskRepository, never()).findById(anyLong());
        verify(taskLabelRepository, never()).deleteByTaskId(anyLong());
        verify(taskLabelRepository, never()).saveAll(anyList());

        // 3. ⭐️ [검증] 빈 리스트가 반환되어야 함
        assertThat(resultIds).isEmpty();
    }

    @Test
    @DisplayName("setLabel: 태스크(Task) ID가 존재하지 않으면 404 예외를 던진다")
    void setLabel_Fail_TaskNotFound() {
        // Given (준비)
        Long invalidTaskId = 999L;
        LabelIdRequestDTO dto = new LabelIdRequestDTO();
        ReflectionTestUtils.setField(dto, "labelIds", List.of(labelId1));

        // 1. ⭐️ [Mocking] 'findById'가 빈 Optional을 반환하도록 '가정'
        given(taskRepository.findById(invalidTaskId)).willReturn(Optional.empty());

        // When & Then (실행 및 검증)
        // 2. ⭐️ [검증] 'EntityNotFoundException'이 발생하는지 확인
        assertThatThrownBy(() -> taskLabelService.setLabel(invalidTaskId, dto))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("setLabel: 라벨(Label) ID가 존재하지 않으면 404 예외를 던진다")
    void setLabel_Fail_LabelNotFound() {
        // Given (준비)
        Long invalidLabelId = 999L;
        // 1. DTO는 '존재하는' 라벨(10L)과 '존재하지 않는' 라벨(999L) 2개를 요청
        List<Long> requestedIds = List.of(labelId1, invalidLabelId);
        LabelIdRequestDTO dto = new LabelIdRequestDTO();
        ReflectionTestUtils.setField(dto, "labelIds", requestedIds);

        // 2. ⭐️ [Mocking] 'findById'는 mockTask를 반환 (Task는 존재)
        given(taskRepository.findById(taskId)).willReturn(Optional.of(mockTask));

        // 3. ⭐️ [Mocking] 'findAllById'는 요청 2개 중 '존재하는' 1개만 반환
        given(labelRepository.findAllById(requestedIds)).willReturn(List.of(mockLabel1));

        // When & Then (실행 및 검증)
        // 4. ⭐️ [검증] 'EntityNotFoundException'이 발생하는지 확인
        //    (requestedIds.size() (2) != existingLabels.size() (1) 이므로)
        assertThatThrownBy(() -> taskLabelService.setLabel(taskId, dto))
                .isInstanceOf(EntityNotFoundException.class);
    }
}