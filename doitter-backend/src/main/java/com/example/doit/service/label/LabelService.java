package com.example.doit.service.label;

import com.example.doit.domain.label.Label;
import com.example.doit.domain.project.Project;
import com.example.doit.dto.label.LabelCreateDTO;
import com.example.doit.dto.label.LabelResponseDTO;
import com.example.doit.dto.label.LabelUpdateDTO;
import com.example.doit.repository.label.LabelRepository;
import com.example.doit.repository.project.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class LabelService {

    private final LabelRepository labelRepository;
    private final ProjectRepository projectRepository;

    public Long create(Long projectId, LabelCreateDTO labelCreateDTO) {

        // [조회]
        if (labelRepository.existsByProjectIdAndName(projectId, labelCreateDTO.getName())) {
            throw new DataIntegrityViolationException("이미 존재하는 라벨명입니다.");
        }

        Project projectReference = projectRepository.getReferenceById(projectId);

        // [실행]
        Label label = toDomain(labelCreateDTO, projectReference);

        return labelRepository.save(label).getId();
    }

    public List<LabelResponseDTO> readList(Long projectId) {

        // [조회]
        List<Label> labelList = labelRepository.findByProjectId(projectId);

        // [실행]
        return labelList.stream().map(this::toDTO).toList();
    }

    public Long update(Long labelId, LabelUpdateDTO labelUpdateDTO) {

        // [조회]
        Label label = labelRepository.findById(labelId)
                .orElseThrow(EntityNotFoundException::new);

        // [실행]
        label.changeName(labelUpdateDTO.getName());
        label.changeColor(labelUpdateDTO.getColor());

        return label.getId();
    }

    public void delete(Long projectId, Long labelId) {

        // [조회]
        Label label = labelRepository.findByIdAndProjectId(labelId, projectId)
                .orElseThrow(EntityNotFoundException::new);

        // [실행]
        labelRepository.delete(label);
    }

    public Label toDomain(LabelCreateDTO labelCreateDTO, Project project) {
        return Label.builder()
                .name(labelCreateDTO.getName())
                .color(labelCreateDTO.getColor())
                .project(project)
                .build();
    }

    public LabelResponseDTO toDTO(Label label) {
        return LabelResponseDTO.builder()
                .labelId(label.getId())
                .name(label.getName())
                .color(label.getColor())
                .build();
    }
}

