package com.adaptive.planner.service;

import com.adaptive.planner.dto.TimeBlockDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class AiPlannerServiceTest {

    private AiPlannerService aiPlannerService;

    @BeforeEach
    void setUp() {
        WebClient webClient = WebClient.builder().build();
        ObjectMapper objectMapper = new ObjectMapper();
        TimeBlockService timeBlockService = mock(TimeBlockService.class);
        NotificationService notificationService = mock(NotificationService.class);
        aiPlannerService = new AiPlannerService(webClient, objectMapper, timeBlockService, notificationService);
    }

    @Test
    @DisplayName("Test shorthand: 'mai 7h cafe 2 tiếng'")
    void testShorthandCafeWithDuration() {
        TimeBlockDto result = aiPlannerService.parseIntent("mai 7h cafe 2 tiếng");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).containsIgnoringCase("cà phê");
        assertThat(result.getDate()).isEqualTo(LocalDate.now().plusDays(1));
        assertThat(result.getStartTime()).isEqualTo("07:00");
        assertThat(result.getEndTime()).isEqualTo("09:00");
        assertThat(result.getDurationMinutes()).isEqualTo(120);
        assertThat(result.getCategory()).isEqualTo("social");
    }

    @Test
    @DisplayName("Test shorthand: '8h java'")
    void testShorthandStudyJava() {
        TimeBlockDto result = aiPlannerService.parseIntent("8h java");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).containsIgnoringCase("Học Java");
        assertThat(result.getStartTime()).isEqualTo("08:00");
        assertThat(result.getEndTime()).isEqualTo("09:00");
        assertThat(result.getDate()).isEqualTo(LocalDate.now());
        assertThat(result.getCategory()).isEqualTo("work");
    }

    @Test
    @DisplayName("Test shorthand: 't2 8-10h hop'")
    void testShorthandMeeting() {
        TimeBlockDto result = aiPlannerService.parseIntent("t2 8-10h hop");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).containsIgnoringCase("Cuộc họp");
        assertThat(result.getStartTime()).isEqualTo("08:00");
        assertThat(result.getEndTime()).isEqualTo("10:00");
        assertThat(result.getCategory()).isEqualTo("work");
    }

    @Test
    @DisplayName("Test shorthand: 'cn 14h gym'")
    void testShorthandGym() {
        TimeBlockDto result = aiPlannerService.parseIntent("cn 14h gym");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).containsIgnoringCase("Tập gym");
        assertThat(result.getStartTime()).isEqualTo("14:00");
        assertThat(result.getCategory()).isEqualTo("health");
    }

    @Test
    @DisplayName("Test casual prompt with missing time: 'chiều mai đi bơi'")
    void testCasualMissingTime() {
        TimeBlockDto result = aiPlannerService.parseIntent("chiều mai đi bơi");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).containsIgnoringCase("bơi");
        assertThat(result.getDate()).isEqualTo(LocalDate.now().plusDays(1));
        assertThat(result.getMissingFields()).contains("TIME");
        assertThat(result.getCategory()).isEqualTo("health");
    }

    @Test
    @DisplayName("Test shorthand: '22h ngủ'")
    void testShorthandSleep() {
        TimeBlockDto result = aiPlannerService.parseIntent("22h ngủ");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).containsIgnoringCase("ngủ");
        assertThat(result.getStartTime()).isEqualTo("22:00");
        assertThat(result.getCategory()).isEqualTo("rest");
    }

    @Test
    @DisplayName("Test shorthand: 'mai 3h dentist'")
    void testShorthandDentist() {
        TimeBlockDto result = aiPlannerService.parseIntent("mai 3h dentist");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).containsIgnoringCase("nha sĩ");
        assertThat(result.getDate()).isEqualTo(LocalDate.now().plusDays(1));
        assertThat(result.getStartTime()).isEqualTo("15:00");
        assertThat(result.getPriority()).isEqualTo("High");
    }

    @Test
    @DisplayName("Test prompt: 'ngày 21 tôi có cuộc họp đột xuất từ 6h tới 8h tối'")
    void testUrgentMeetingOnDate() {
        TimeBlockDto result = aiPlannerService.parseIntent("ngày 21 tôi có cuộc họp đột xuất từ 6h tới 8h tối");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).containsIgnoringCase("họp");
        assertThat(result.getDate().getDayOfMonth()).isEqualTo(21);
        assertThat(result.getStartTime()).isEqualTo("18:00");
        assertThat(result.getEndTime()).isEqualTo("20:00");
        assertThat(result.getDurationMinutes()).isEqualTo(120);
        assertThat(result.getCategory()).isEqualTo("urgent");
        assertThat(result.getPriority()).isEqualTo("High");
    }

    @Test
    @DisplayName("Test prompt with minutes: 'ngày 21 tôi có cuộc họp đột xuất từ 6h30 tới 8h30 tối'")
    void testUrgentMeetingWithMinutesOnDate() {
        TimeBlockDto result = aiPlannerService.parseIntent("ngày 21 tôi có cuộc họp đột xuất từ 6h30 tới 8h30 tối");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).containsIgnoringCase("họp");
        assertThat(result.getDate().getDayOfMonth()).isEqualTo(21);
        assertThat(result.getStartTime()).isEqualTo("18:30");
        assertThat(result.getEndTime()).isEqualTo("20:30");
        assertThat(result.getDurationMinutes()).isEqualTo(120);
        assertThat(result.getCategory()).isEqualTo("urgent");
        assertThat(result.getPriority()).isEqualTo("High");
    }

    @Test
    @DisplayName("Test colon format: '6:30 - 8:30 pm'")
    void testColonRangeWithPm() {
        TimeBlockDto result = aiPlannerService.parseIntent("6:30 - 8:30 pm");

        assertThat(result).isNotNull();
        assertThat(result.getStartTime()).isEqualTo("18:30");
        assertThat(result.getEndTime()).isEqualTo("20:30");
        assertThat(result.getDurationMinutes()).isEqualTo(120);
    }

    @Test
    @DisplayName("Smart Default: Urgent meeting shifts conflicting Study block and protects bedtime")
    void testSmartDefaultReschedule() {
        // Given current timetable:
        // 17:00-18:00 Gym
        // 18:00-19:00 Dinner (PROTECTED)
        // 19:00-21:00 Study (NORMAL)
        // 21:00-22:00 Free time / Gaming (FLEXIBLE)
        TimeBlockDto gym = TimeBlockDto.builder()
                .id("1").title("🏋️ Gym").startTime("17:00").endTime("18:00")
                .category("health").energyLevel("high").priority("NORMAL").build();
        TimeBlockDto dinner = TimeBlockDto.builder()
                .id("2").title("🍽️ Dinner").startTime("18:00").endTime("19:00")
                .category("rest").energyLevel("low").priority("PROTECTED").isMovable(false).build();
        TimeBlockDto study = TimeBlockDto.builder()
                .id("3").title("📚 Study").startTime("19:00").endTime("21:00")
                .category("work").energyLevel("medium").priority("NORMAL").build();
        TimeBlockDto freeTime = TimeBlockDto.builder()
                .id("4").title("🎮 Gaming").startTime("21:00").endTime("22:00")
                .category("rest").energyLevel("low").priority("FLEXIBLE").build();

        // Urgent meeting: 19:00-21:00
        com.adaptive.planner.dto.RescheduleRequest request = com.adaptive.planner.dto.RescheduleRequest.builder()
                .urgentEvent("Họp gấp với team")
                .targetTime("19:00")
                .durationMinutes(120)
                .currentBlocks(java.util.List.of(gym, dinner, study, freeTime))
                .build();

        com.adaptive.planner.dto.RescheduleResponseDto response = aiPlannerService.generateRescheduleScenarios(request);

        assertThat(response).isNotNull();
        assertThat(response.getRecommendedScenario()).isNotNull();
        assertThat(response.getExplanation()).isNotNull();
        assertThat(response.getExplanation().getReasons()).isNotEmpty();

        // Check recommended blocks:
        // Gym (17:00-18:00) untouched
        // Dinner (18:00-19:00) protected & untouched
        // Urgent Meeting (19:00-21:00) present
        // Shifted Study (starts at 21:15 after 15m buffer -> 21:15-23:15 would exceed 22:30 cutoff, so deferred to tomorrow inbox!)
        assertThat(response.getExplanation().getReasons().toString()).contains("23:00–07:00");
        assertThat(response.getRecommendedScenario().getBlocks()).anyMatch(b -> b.getTitle().contains("Họp gấp"));
        assertThat(response.getRecommendedScenario().getBlocks()).anyMatch(b -> b.getTitle().contains("Gym"));
        assertThat(response.getRecommendedScenario().getBlocks()).anyMatch(b -> b.getTitle().contains("Dinner"));
    }
}
