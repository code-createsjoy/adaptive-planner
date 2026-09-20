package com.adaptive.planner.service;

import com.adaptive.planner.dto.CalmSlotDto;
import com.adaptive.planner.dto.TimeBlockDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CalmSlotServiceTest {

    private TimeBlockService timeBlockService;
    private CalmSlotService calmSlotService;

    @BeforeEach
    void setUp() {
        timeBlockService = mock(TimeBlockService.class);
        calmSlotService = new CalmSlotService(timeBlockService);
    }

    @Test
    @DisplayName("Finds calm opening in empty morning window (09:30-11:30)")
    void testFindCalmOpeningInMorning() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // Schedule: 08:00-09:00 Standup, 13:00-15:00 Deep Work
        TimeBlockDto standup = TimeBlockDto.builder()
                .title("Daily Standup").startTime("08:00").endTime("09:00").category("work").energyLevel("medium").build();
        TimeBlockDto deepWork = TimeBlockDto.builder()
                .title("Project Build").startTime("13:00").endTime("15:00").category("work").energyLevel("high").build();

        when(timeBlockService.getBlocksForDate(any(LocalDate.class))).thenReturn(List.of(standup, deepWork));

        List<CalmSlotDto> openings = calmSlotService.findCalmOpenings(tomorrow, 60, "work", "medium");

        assertThat(openings).isNotEmpty();
        // Should find morning calm opening between Standup and Deep work
        assertThat(openings).anyMatch(s -> s.getStartTime().compareTo("09:00") >= 0 && s.getEndTime().compareTo("13:00") <= 0);
        // And an afternoon opening after Deep work
        assertThat(openings).anyMatch(s -> s.getStartTime().compareTo("15:00") >= 0);
    }
}
