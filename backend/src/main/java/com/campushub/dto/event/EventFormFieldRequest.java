package com.campushub.dto.event;

import com.campushub.entity.EventFormField.FieldType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventFormFieldRequest {
    @NotBlank(message = "Field label is required")
    private String fieldLabel;

    @NotNull(message = "Field type is required")
    private FieldType fieldType;

    private boolean required;

    @Builder.Default
    private Integer fieldOrder = 0;

    private String options;
}
