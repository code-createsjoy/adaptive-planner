package com.adaptive.planner.service;

import com.adaptive.planner.dto.AdaptationActionResultDto;
import com.adaptive.planner.dto.ApplyAdaptationRequest;
import com.adaptive.planner.dto.TimeBlockDto;
import com.adaptive.planner.entity.AdaptationActionEntity;
import com.adaptive.planner.repository.AdaptationActionRepository;
import com.adaptive.planner.repository.TimeBlockRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdaptationServiceTest {

    @Mock
    private AdaptationActionRepository actionRepository;

    @Mock
    private TimeBlockService timeBlockService;

    @Mock
    private TimeBlockRepository timeBlockRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @InjectMocks
    private AdaptationService adaptationService;

    private LocalDate testDate;

    @BeforeEach
    void setUp() {
        testDate = LocalDate.of(2026, 9, 20);
    }

    @Test
    @DisplayName("applyAdaptation saves pre-state snapshot and applies new blocks")
    void testApplyAdaptation() {
        TimeBlockDto existing = TimeBlockDto.builder()
                .id("1")
                .title("Study")
                .startTime("19:00")
                .endTime("21:00")
                .date(testDate)
                .priority("NORMAL")
                .isMovable(true)
                .build();

        when(timeBlockService.getBlocksForDate(testDate))
                .thenReturn(List.of(existing));

        TimeBlockDto newBlock = TimeBlockDto.builder()
                .title("Urgent Meeting")
                .startTime("19:00")
                .endTime("20:30")
                .date(testDate)
                .priority("HIGH")
                .build();

        when(timeBlockService.batchApplyScenario(any()))
                .thenReturn(List.of(newBlock));

        AdaptationActionEntity savedAction = AdaptationActionEntity.builder()
                .id(100L)
                .date(testDate)
                .reason("Urgent meeting")
                .status("APPLIED")
                .createdAt(LocalDateTime.now())
                .build();

        when(actionRepository.save(any(AdaptationActionEntity.class)))
                .thenReturn(savedAction);

        ApplyAdaptationRequest request = ApplyAdaptationRequest.builder()
                .date(testDate)
                .reason("Urgent meeting")
                .newBlocks(List.of(newBlock))
                .build();

        AdaptationActionResultDto result = adaptationService.applyAdaptation(request);

        assertThat(result).isNotNull();
        assertThat(result.getActionId()).isEqualTo(100L);
        assertThat(result.getStatus()).isEqualTo("APPLIED");

        verify(timeBlockService).getBlocksForDate(testDate);
        verify(timeBlockService).batchApplyScenario(any());
        verify(actionRepository).save(any(AdaptationActionEntity.class));
    }

    @Test
    @DisplayName("undoAdaptation restores exact beforeSnapshot state within 10s window")
    void testUndoAdaptationSuccess() throws Exception {
        TimeBlockDto oldBlock = TimeBlockDto.builder()
                .id("1")
                .title("Study")
                .startTime("19:00")
                .endTime("21:00")
                .date(testDate)
                .priority("NORMAL")
                .isMovable(true)
                .build();

        String snapshotJson = objectMapper.writeValueAsString(List.of(oldBlock));

        AdaptationActionEntity action = AdaptationActionEntity.builder()
                .id(100L)
                .date(testDate)
                .reason("Urgent meeting")
                .status("APPLIED")
                .beforeSnapshotJson(snapshotJson)
                .createdAt(LocalDateTime.now())
                .build();

        when(actionRepository.findById(100L)).thenReturn(Optional.of(action));
        when(timeBlockService.batchApplyScenario(any())).thenReturn(List.of(oldBlock));
        when(timeBlockService.getBlocksForDate(testDate)).thenReturn(List.of(oldBlock));

        AdaptationActionResultDto result = adaptationService.undoAdaptation(100L);

        assertThat(result).isNotNull();
        assertThat(result.getActionId()).isEqualTo(100L);
        assertThat(result.getStatus()).isEqualTo("ROLLED_BACK");

        verify(timeBlockRepository).deleteByDate(testDate);
        verify(timeBlockService).batchApplyScenario(any());
        assertThat(action.getStatus()).isEqualTo("ROLLED_BACK");
    }

    @Test
    @DisplayName("undoAdaptation returns existing rolled back state if already rolled back")
    void testUndoAlreadyRolledBack() {
        AdaptationActionEntity action = AdaptationActionEntity.builder()
                .id(100L)
                .date(testDate)
                .status("ROLLED_BACK")
                .createdAt(LocalDateTime.now())
                .build();

        when(actionRepository.findById(100L)).thenReturn(Optional.of(action));
        when(timeBlockService.getBlocksForDate(testDate)).thenReturn(List.of());

        AdaptationActionResultDto result = adaptationService.undoAdaptation(100L);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("ROLLED_BACK");
        assertThat(result.getMessage()).contains("đã được hoàn tác trước đó");
    }
}
