package com.example.doit.domain.task;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Builder
@ToString
public class TaskLabelId implements Serializable {

    private Long taskId;

    private Long labelId;

}
