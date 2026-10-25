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
public class EventFormFieldResponse {
    private Long id;
    private Long eventId;
    private String fieldLabel;
    private FieldType fieldType;
    private boolean required;
    private Integer fieldOrder;
    private String options;
}
