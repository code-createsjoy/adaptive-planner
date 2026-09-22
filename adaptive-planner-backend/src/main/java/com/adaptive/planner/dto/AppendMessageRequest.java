package com.adaptive.planner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppendMessageRequest {
    private String role;
    private String content;
    private String metadataJson;
}
