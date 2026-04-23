package com.example.doit.service.label;

import com.example.doit.domain.label.Label;
import com.example.doit.domain.project.Project;
import com.example.doit.dto.label.LabelCreateDTO;
import com.example.doit.dto.label.LabelResponseDTO;
import com.example.doit.dto.label.LabelUpdateDTO;
import com.example.doit.repository.label.LabelRepository;
import com.example.doit.repository.project.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class) // 1. Mockito 사용
class LabelServiceTest {

    @Mock
    private LabelRepository labelRepository;
    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks // 2. Mock들을 Service에 주입
    private LabelService labelService;

    // --- 테스트용 공통 더미 데이터 ---
    private Project mockProject;
    private Label mockLabel;
    private final Long projectId = 1L;
    private final Long labelId = 10L;

    @BeforeEach
    void setUp() {
        // 공통 프로젝트 객체
        mockProject = Project.builder().build();
        ReflectionTestUtils.setField(mockProject, "id", projectId);

        // 공통 라벨 객체 (update, delete 테스트용)
        mockLabel = Label.builder()
                .name("Original Name")
                .color("#000000")
                .project(mockProject)
                .build();
        ReflectionTestUtils.setField(mockLabel, "id", labelId);
    }

    @Test
    @DisplayName("create: 새 라벨을 성공적으로 생성한다")
    void testCreateSuccess() {
        // Given (준비)
        LabelCreateDTO dto = LabelCreateDTO.builder().name("New Label").color("#123456").build();

        // 1. [Mocking] 이름 중복 검사(existsBy)는 'false'를 반환
        given(labelRepository.existsByProjectIdAndName(projectId, "New Label")).willReturn(false);

        // 2. [Mocking] 프로젝트 'getReferenceById'는 'mockProject'를 반환
        given(projectRepository.getReferenceById(projectId)).willReturn(mockProject);

        // 3. [Mocking] 'save'가 호출되면, ID가 100L로 설정된 Label 객체를 반환하도록 '가정'
        given(labelRepository.save(any(Label.class))).willAnswer(invocation -> {
            Label label = invocation.getArgument(0);
            ReflectionTestUtils.setField(label, "id", 100L);
            return label;
        });

        // 4. 'save'에 전달된 실제 Label 객체를 캡처하기 위한 준비
        ArgumentCaptor<Label> labelCaptor = ArgumentCaptor.forClass(Label.class);

        // When (실행)
        Long newLabelId = labelService.create(projectId, dto);

        // Then (검증)
        // 5. [검증] 반환된 ID가 100L인지
        assertThat(newLabelId).isEqualTo(100L);

        // 6. [검증] 'save' 메서드가 1번 호출되었는지
        verify(labelRepository).save(labelCaptor.capture());

        // 7. [검증] 'save'에 전달된 Label 객체의 'name'과 'color'가 DTO와 일치하는지
        Label savedLabel = labelCaptor.getValue();
        assertThat(savedLabel.getName()).isEqualTo("New Label");
        assertThat(savedLabel.getColor()).isEqualTo("#123456");
        assertThat(savedLabel.getProject()).isEqualTo(mockProject);
    }

    @Test
    @DisplayName("create: 이름이 중복되면 409 (DataIntegrityViolationException) 예외를 던진다")
    void testCreateFailDuplicateName() {
        // Given (준비)
        LabelCreateDTO dto = LabelCreateDTO.builder().name("Duplicate Label").build();

        // 1. ⭐️ [Mocking] 이름 중복 검사(existsBy)가 'true'를 반환
        given(labelRepository.existsByProjectIdAndName(projectId, "Duplicate Label")).willReturn(true);

        // When & Then (실행 및 검증)
        // 2. ⭐️ [검증] 예외가 발생하는지
        assertThatThrownBy(() -> labelService.create(projectId, dto))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("이미 존재하는 라벨명입니다.");

        // 3. ⭐️ [검증] 'save'는 절대 호출되면 안 됨
        verify(labelRepository, never()).save(any(Label.class));
    }

    @Test
    @DisplayName("readList: 특정 프로젝트의 모든 라벨을 DTO 리스트로 변환하여 반환한다")
    void testReadListSuccess() {
        // Given (준비)
        // 1. [Mocking] 'findByProjectId'가 2개의 라벨을 반환하도록 '가정'
        Label label2 = Label.builder().name("Label 2").color("#FFFFFF").build();
        ReflectionTestUtils.setField(label2, "id", 11L);

        given(labelRepository.findByProjectId(projectId)).willReturn(List.of(mockLabel, label2));

        // When (실행)
        List<LabelResponseDTO> resultDTOs = labelService.readList(projectId);

        // Then (검증)
        // 2. [검증] DTO 리스트의 크기가 2인지
        assertThat(resultDTOs).hasSize(2);

        // 3. [검증] DTO 변환이 잘 되었는지 (Service의 toDTO 메서드 검증)
        assertThat(resultDTOs.get(0).getLabelId()).isEqualTo(labelId);
        assertThat(resultDTOs.get(0).getName()).isEqualTo("Original Name");
        assertThat(resultDTOs.get(1).getName()).isEqualTo("Label 2");
    }

    @Test
    @DisplayName("update: 라벨의 이름과 색상을 성공적으로 변경한다 (더티 체킹)")
    void testUpdateSuccess() {
        // Given (준비)
        LabelUpdateDTO dto = LabelUpdateDTO.builder().name("Updated Name").color("#FFFFFF").build();

        // 1. [Mocking] 'findById'가 'mockLabel' (원본)을 반환하도록 '가정'
        given(labelRepository.findById(labelId)).willReturn(Optional.of(mockLabel));

        // When (실행)
        Long updatedId = labelService.update(labelId, dto);

        // Then (검증)
        // 2. [검증] 반환된 ID가 맞는지
        assertThat(updatedId).isEqualTo(labelId);

        // 3. ⭐️ [검증] 'mockLabel' 객체의 상태가 DTO대로 '변경'되었는지 (더티 체킹 검증)
        assertThat(mockLabel.getName()).isEqualTo("Updated Name");
        assertThat(mockLabel.getColor()).isEqualTo("#FFFFFF");
    }

    @Test
    @DisplayName("update: 존재하지 않는 라벨 ID면 404 (EntityNotFoundException) 예외를 던진다")
    void testUpdateFailNotFound() {
        // Given (준비)
        LabelUpdateDTO dto = LabelUpdateDTO.builder().name("Updated Name").build();

        // 1. [Mocking] 'findById'가 빈 Optional을 반환
        given(labelRepository.findById(999L)).willReturn(Optional.empty());

        // When & Then (실행 및 검증)
        assertThatThrownBy(() -> labelService.update(999L, dto))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("delete: 라벨을 성공적으로 삭제한다")
    void testDeleteSuccess() {
        // Given (준비)
        // 1. [Mocking] 'findByIdAndProjectId'가 'mockLabel'을 반환
        given(labelRepository.findByIdAndProjectId(labelId, projectId)).willReturn(Optional.of(mockLabel));

        // When (실행)
        labelService.delete(projectId, labelId);

        // Then (검증)
        // 2. ⭐️ [검증] 'delete' 메서드가 'mockLabel' 객체를 인자로 1번 호출되었는지
        verify(labelRepository).delete(mockLabel);
    }

    @Test
    @DisplayName("delete: 존재하지 않거나 다른 프로젝트의 라벨이면 404 예외를 던진다")
    void testDeleteFailNotFound() {
        // Given (준비)
        // 1. [Mocking] 'findByIdAndProjectId'가 빈 Optional을 반환
        given(labelRepository.findByIdAndProjectId(999L, projectId)).willReturn(Optional.empty());

        // When & Then (실행 및 검증)
        assertThatThrownBy(() -> labelService.delete(projectId, 999L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}