package com.campushub.dto.event;

import com.campushub.entity.EventFormField.FieldType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventFormResponseDto {
    private Long fieldId;
    private String fieldLabel;
    private FieldType fieldType;
    private String responseValue;
}
