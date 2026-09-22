package com.adaptive.planner.service;

import com.adaptive.planner.dto.CyclePredictionDto;
import com.adaptive.planner.dto.DailyCheckinDto;
import com.adaptive.planner.dto.ProactiveAdaptationRequest;
import com.adaptive.planner.dto.ProactiveAdaptationResponse;
import com.adaptive.planner.entity.DailyCheckinEntity;
import com.adaptive.planner.entity.PeriodFlow;
import com.adaptive.planner.entity.TimeBlockEntity;
import com.adaptive.planner.repository.DailyCheckinRepository;
import com.adaptive.planner.repository.TimeBlockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DailyCheckinServiceTest {

    @Mock
    private DailyCheckinRepository dailyCheckinRepository;

    @Mock
    private CyclePredictionService cyclePredictionService;

    @Mock
    private TimeBlockRepository timeBlockRepository;

    private DailyCheckinService dailyCheckinService;

    @BeforeEach
    void setUp() {
        dailyCheckinService = new DailyCheckinService(dailyCheckinRepository, cyclePredictionService, timeBlockRepository);
    }

    @Test
    void upsertCheckin_whenNew_savesAndReturnsDto() {
        LocalDate date = LocalDate.of(2026, 9, 21);
        DailyCheckinDto requestDto = DailyCheckinDto.builder()
                .checkinDate(date)
                .moodEmoji("😄")
                .moodLabel("Vui vẻ")
                .energyLevel(4)
                .note("Hôm nay làm việc hiệu quả")
                .isPeriodDay(false)
                .build();

        when(dailyCheckinRepository.findByUserIdAndCheckinDate("default-user", date))
                .thenReturn(Optional.empty());

        DailyCheckinEntity savedEntity = DailyCheckinEntity.builder()
                .id(1L)
                .userId("default-user")
                .checkinDate(date)
                .moodEmoji("😄")
                .moodLabel("Vui vẻ")
                .energyLevel(4)
                .note("Hôm nay làm việc hiệu quả")
                .isPeriodDay(false)
                .flowIntensity(PeriodFlow.NONE)
                .build();

        when(dailyCheckinRepository.save(any(DailyCheckinEntity.class))).thenReturn(savedEntity);

        DailyCheckinDto result = dailyCheckinService.upsertCheckin("default-user", requestDto);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getMoodEmoji()).isEqualTo("😄");
        assertThat(result.getEnergyLevel()).isEqualTo(4);
        verify(dailyCheckinRepository).save(any(DailyCheckinEntity.class));
    }

    @Test
    void upsertCheckin_whenExisting_updatesFields() {
        LocalDate date = LocalDate.of(2026, 9, 21);
        DailyCheckinEntity existingEntity = DailyCheckinEntity.builder()
                .id(1L)
                .userId("default-user")
                .checkinDate(date)
                .moodEmoji("🥱")
                .energyLevel(2)
                .isPeriodDay(false)
                .build();

        when(dailyCheckinRepository.findByUserIdAndCheckinDate("default-user", date))
                .thenReturn(Optional.of(existingEntity));

        when(dailyCheckinRepository.save(existingEntity)).thenReturn(existingEntity);

        DailyCheckinDto updateDto = DailyCheckinDto.builder()
                .checkinDate(date)
                .moodEmoji("🔥")
                .energyLevel(5)
                .isPeriodDay(true)
                .flowIntensity(PeriodFlow.LIGHT)
                .build();

        DailyCheckinDto result = dailyCheckinService.upsertCheckin("default-user", updateDto);

        assertThat(existingEntity.getMoodEmoji()).isEqualTo("🔥");
        assertThat(existingEntity.getEnergyLevel()).isEqualTo(5);
        assertThat(existingEntity.getIsPeriodDay()).isTrue();
        assertThat(existingEntity.getFlowIntensity()).isEqualTo(PeriodFlow.LIGHT);
    }

    @Test
    void getCheckinsInRange_returnsMappedDtoList() {
        LocalDate start = LocalDate.of(2026, 9, 1);
        LocalDate end = LocalDate.of(2026, 9, 30);

        DailyCheckinEntity entity = DailyCheckinEntity.builder()
                .id(1L)
                .userId("default-user")
                .checkinDate(LocalDate.of(2026, 9, 15))
                .moodEmoji("😊")
                .build();

        when(dailyCheckinRepository.findByUserIdAndCheckinDateBetweenOrderByCheckinDateAsc("default-user", start, end))
                .thenReturn(List.of(entity));

        List<DailyCheckinDto> result = dailyCheckinService.getCheckinsInRange("default-user", start, end);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMoodEmoji()).isEqualTo("😊");
    }

    @Test
    void getCyclePredictions_callsPredictionService() {
        when(dailyCheckinRepository.findByUserIdAndIsPeriodDayTrueOrderByCheckinDateAsc("default-user"))
                .thenReturn(List.of());

        CyclePredictionDto predictionDto = CyclePredictionDto.builder()
                .averageCycleLengthDays(28)
                .build();

        when(cyclePredictionService.predictUpcomingCycles(eq(List.of()), any(LocalDate.class)))
                .thenReturn(predictionDto);

        CyclePredictionDto result = dailyCheckinService.getCyclePredictions("default-user");

        assertThat(result.getAverageCycleLengthDays()).isEqualTo(28);
    }

    @Test
    void evaluateProactiveAdaptation_lowEnergyAndHeavyBlocks_returnsRecommendation() {
        LocalDate date = LocalDate.of(2026, 9, 21);
        ProactiveAdaptationRequest request = ProactiveAdaptationRequest.builder()
                .checkinDate(date)
                .energyLevel(2)
                .isPeriodDay(true)
                .build();

        TimeBlockEntity heavyBlock = TimeBlockEntity.builder()
                .id(101L)
                .title("Deep Coding Session")
                .category("work")
                .energyLevel("high")
                .startTime("09:00")
                .endTime("11:30")
                .isCompleted(false)
                .status("ACTIVE")
                .build();

        when(timeBlockRepository.findByDateOrderByStartTimeAsc(date)).thenReturn(List.of(heavyBlock));

        ProactiveAdaptationResponse response = dailyCheckinService.evaluateProactiveAdaptation("default-user", request);

        assertThat(response.isHasRecommendation()).isTrue();
        assertThat(response.getHeavyBlockIds()).containsExactly(101L);
        assertThat(response.getReason()).contains("chu kỳ", "mức năng lượng thấp");
    }
}
