package com.adaptive.planner.service;

import com.adaptive.planner.dto.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiPlannerService {

    private final WebClient groqWebClient;
    private final ObjectMapper objectMapper;
    private final TimeBlockService timeBlockService;
    private final NotificationService notificationService;

    @Value("${app.groq.api-key:}")
    private String apiKey;

    @Value("${app.groq.model:llama-3.3-70b-versatile}")
    private String model;

    public TimeBlockDto parseIntent(String userPrompt) {
        if (apiKey == null || apiKey.isBlank()) {
            log.info("Groq API key not set. Using intelligent fallback parser for: {}", userPrompt);
            return fallbackParseIntent(userPrompt);
        }

        try {
            String todayStr = java.time.LocalDate.now().toString();
            String systemPrompt = """
                You are Adaptive Planner AI, an empathetic time management assistant for neurodivergent individuals.
                Today's date reference is: %s (%s).
                Your task is to parse the user's natural language request (in English or Vietnamese) into a single TimeBlock JSON object.
                Schema format:
                {
                  "title": "string",
                  "detail": "string",
                  "date": "YYYY-MM-DD",
                  "startTime": "HH:mm",
                  "endTime": "HH:mm",
                  "durationMinutes": 60,
                  "missingFields": ["TIME" | "DURATION"],
                  "confidence": 0.95,
                  "category": "work" | "social" | "health" | "rest" | "urgent" | "transition",
                  "energyLevel": "high" | "medium" | "low",
                  "priority": "High" | "Normal" | "Protected" | "Flexible",
                  "reminderMinutesBefore": [30, 10, 0],
                  "isBufferBlock": false,
                  "microSteps": [
                    {"id": "1", "text": "Step 1", "done": false},
                    {"id": "2", "text": "Step 2", "done": false}
                  ]
                }
                CRITICAL RULES FOR DATE & TIME PARSING:
                1. Date resolution:
                   - If user mentions 'ngày 21', 'hôm 21', '21/9', 'ngày 21 tháng 9', resolve 'date' to the 21st of this month (e.g. '2026-09-21').
                   - If 'mai' or 'tomorrow', use tomorrow's date.
                   - If 'mốt', use 2 days from today.
                   - If no date is specified, use today's date '%s'.
                2. Vietnamese 24-hour time conversion:
                   - 'sáng' (AM): 6h sáng -> '06:00', 6h30 sáng -> '06:30', 8h sáng -> '08:00'
                   - 'trưa' (Noon): 12h trưa -> '12:00', 11h30 -> '11:30'
                   - 'chiều' (PM): 2h chiều -> '14:00', 2h30 chiều -> '14:30', 4h chiều -> '16:00', 5h chiều -> '17:00'
                   - 'tối' / 'đêm' (Evening/Night): 6h tối -> '18:00', 6h30 tối -> '18:30', 7h tối -> '19:00', 8h tối -> '20:00', 8h30 tối -> '20:30', 9h tối -> '21:00', 10h tối -> '22:00'
                   - 'từ 6h30 tới 8h30 tối' or '6h30-8h30 tối' -> startTime: '18:30', endTime: '20:30'.
                   - 'từ 6h tới 8h tối' or '6h-8h tối' -> startTime: '18:00', endTime: '20:00'.
                3. Urgent / Sudden tasks:
                   - If user mentions 'đột xuất', 'khẩn cấp', 'gấp', 'emergency', set category: 'urgent' and priority: 'High'.
                4. Gap detection:
                   - If time or duration is omitted by user, include 'TIME' or 'DURATION' in 'missingFields'.
                Return ONLY valid JSON without markdown wrapping.
                """.formatted(todayStr, java.time.LocalDate.now().getDayOfWeek(), todayStr);

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "response_format", Map.of("type", "json_object"),
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    ),
                    "temperature", 0.2
            );

            String responseJson = groqWebClient.post()
                    .uri("/openai/v1/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseJson);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            return objectMapper.readValue(content, TimeBlockDto.class);

        } catch (Exception e) {
            log.error("Failed to parse intent via Groq, falling back to local heuristic", e);
            return fallbackParseIntent(userPrompt);
        }
    }

    public RescheduleResponseDto generateRescheduleScenarios(RescheduleRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            log.info("Groq API key not set. Generating deterministic neurodivergent-friendly Smart Default scenarios.");
            return fallbackGenerateScenarios(request);
        }

        try {
            String systemPrompt = """
                You are Adaptive Planner AI, an empathetic assistant specialized in neurodivergent time management and dynamic schedule adaptation.
                Analyze the current timetable and the incoming urgent interruption or schedule conflict.
                
                MULTI-FACTOR DECISION RULES:
                1. Hard Constraints & Protected Inviolability:
                   - Blocks with priority "PROTECTED" or category "rest"/"health" (like Sleep 23:00–07:00 or Family Dinner) are inviolable boundaries. NEVER overwrite or push tasks into sleep hours (23:00–07:00).
                   - Fixed blocks (isMovable = false) cannot be moved.
                2. Priority vs. Deadline Decoupling:
                   - Priority (PROTECTED, HIGH, NORMAL, FLEXIBLE) indicates intrinsic life importance.
                   - Deadline indicates temporal urgency. A NORMAL task with a deadline tonight takes precedence over a HIGH task with a deadline next week.
                3. Disruption Minimization:
                   - Shift the fewest number of blocks possible.
                   - Insert 15-minute transition buffers between adjusted blocks.
                   - If evening schedule is full (reaching 22:30/23:00), defer non-urgent tasks to Tomorrow Inbox (status: "DEFERRED") instead of cramming into bedtime.
                
                Generate a single best "recommendedScenario" along with 2 "alternativeScenarios" and structured "explanation" in Vietnamese.
                
                Schema format:
                {
                  "analysis": "Giải thích ngắn gọn, đồng cảm về sự kiện trùng lịch và cách giải quyết tối ưu.",
                  "explanation": {
                    "whatChanged": "Sự kiện X (HH:mm–HH:mm) gây trùng với task Y.",
                    "whatWillHappen": "Task Y được chuyển sang slot phù hợp/ngày mai, bảo toàn các khung giờ quan trọng.",
                    "reasons": [
                      "Bảo vệ tuyệt đối khung giờ nghỉ ngơi/ngủ (23:00–07:00)",
                      "Ưu tiên hoàn thành các task có hạn chót trong ngày",
                      "Tự động chèn 15 phút đệm chuyển tiếp để tránh quá tải não bộ"
                    ],
                    "confidenceLevel": 0.95
                  },
                  "recommendedScenario": {
                    "id": "recommended",
                    "title": "✦ Điều chỉnh thông minh (Khuyến nghị)",
                    "description": "Phương án cân bằng nhất, tối thiểu hóa xáo trộn lịch trình.",
                    "energyImpact": "medium",
                    "highlightText": "Bảo toàn deadline và thời gian nghỉ ngơi.",
                    "tag": "Optimized",
                    "blocks": [ /* array of TimeBlockDto objects */ ]
                  },
                  "alternativeScenarios": [
                    {
                      "id": "alt_cascade",
                      "title": "Dời toàn bộ về sau (Cascade Shift)",
                      "description": "Trượt toàn bộ lịch phía sau kèm 15m đệm.",
                      "energyImpact": "medium",
                      "highlightText": "Giữ nguyên mọi việc trong ngày.",
                      "tag": "Alternative",
                      "blocks": [ /* array of TimeBlockDto objects */ ]
                    },
                    {
                      "id": "alt_defer",
                      "title": "Zero-Guilt / Tạm hoãn sang ngày mai",
                      "description": "Chuyển các việc không khẩn sang Tomorrow Inbox.",
                      "energyImpact": "low",
                      "highlightText": "Giảm tải tối đa cho não bộ.",
                      "tag": "Low-Demand",
                      "blocks": [ /* array of TimeBlockDto objects */ ]
                    }
                  ]
                }
                Return ONLY valid JSON without markdown wrapping.
                """;

            String userContent = "Current blocks: " + (request.getCurrentBlocks() != null ? objectMapper.writeValueAsString(request.getCurrentBlocks()) : "[]") +
                    "\nUrgent event: " + request.getUrgentEvent() +
                    "\nTarget start time: " + request.getTargetTime() +
                    "\nDuration minutes: " + request.getDurationMinutes();

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "response_format", Map.of("type", "json_object"),
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userContent)
                    ),
                    "temperature", 0.2
            );

            String responseJson = groqWebClient.post()
                    .uri("/openai/v1/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseJson);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            RescheduleResponseDto res = objectMapper.readValue(content, RescheduleResponseDto.class);

            // Ensure backward compatibility list
            if (res.getScenarios() == null || res.getScenarios().isEmpty()) {
                List<ScenarioDto> list = new ArrayList<>();
                if (res.getRecommendedScenario() != null) list.add(res.getRecommendedScenario());
                if (res.getAlternativeScenarios() != null) list.addAll(res.getAlternativeScenarios());
                res.setScenarios(list);
            }

            try {
                notificationService.createNotification(CreateNotificationRequest.builder()
                        .type("SCHEDULE_CONFLICT")
                        .priority("HIGH")
                        .title("Phát hiện xung đột lịch trình")
                        .message("Có sự kiện phát sinh (" + request.getUrgentEvent() + ") gây trùng lịch. AI đã chuẩn bị 3 phương án điều chỉnh thích ứng.")
                        .actionType("VIEW_SCHEDULE")
                        .eventKey("schedule_conflict:" + System.currentTimeMillis() / 60000)
                        .build());
            } catch (Exception ex) {
                log.warn("Could not emit schedule conflict notification: {}", ex.getMessage());
            }

            return res;

        } catch (Exception e) {
            log.error("Failed to generate reschedule scenarios via Groq, falling back to local engine", e);
            RescheduleResponseDto fallback = fallbackGenerateScenarios(request);
            try {
                notificationService.createNotification(CreateNotificationRequest.builder()
                        .type("SCHEDULE_CONFLICT")
                        .priority("HIGH")
                        .title("Phát hiện xung đột lịch trình")
                        .message("Có sự kiện phát sinh (" + request.getUrgentEvent() + ") gây trùng lịch. AI đã chuẩn bị 3 phương án điều chỉnh thích ứng.")
                        .actionType("VIEW_SCHEDULE")
                        .eventKey("schedule_conflict:" + System.currentTimeMillis() / 60000)
                        .build());
            } catch (Exception ex) {
                log.warn("Could not emit schedule conflict notification: {}", ex.getMessage());
            }
            return fallback;
        }
    }

    public TaskBreakdownResponseDto breakdownTask(String taskTitle) {
        if (apiKey == null || apiKey.isBlank()) {
            return fallbackTaskBreakdown(taskTitle);
        }

        try {
            String systemPrompt = """
                You are Adaptive Planner AI. The user feels overwhelmed or has Executive Dysfunction.
                Break down the given task into 3-5 micro-steps that take UNDER 5 minutes each.
                Schema format:
                {
                  "microSteps": [
                    {"id": "ms-1", "text": "First tiny step (e.g. Open document and write title)", "done": false},
                    {"id": "ms-2", "text": "Second tiny step", "done": false}
                  ]
                }
                """;

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "response_format", Map.of("type", "json_object"),
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", "Task: " + taskTitle)
                    ),
                    "temperature", 0.2
            );

            String responseJson = groqWebClient.post()
                    .uri("/openai/v1/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseJson);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            return objectMapper.readValue(content, TaskBreakdownResponseDto.class);

        } catch (Exception e) {
            log.error("Failed to break down task via Groq", e);
            return fallbackTaskBreakdown(taskTitle);
        }
    }

    // Fallbacks
    private TimeBlockDto fallbackParseIntent(String prompt) {
        String lower = prompt.toLowerCase();

        // 1. Parse Date
        java.time.LocalDate now = java.time.LocalDate.now();
        java.time.LocalDate targetDate = now;

        if (lower.contains("ngày mốt") || lower.contains("mốt") || lower.contains("ngày kia")) {
            targetDate = now.plusDays(2);
        } else if (lower.contains("ngày mai") || lower.contains(" mai") || lower.startsWith("mai ") || lower.startsWith("mai\t") || lower.equals("mai") || lower.contains("tomorrow")) {
            targetDate = now.plusDays(1);
        } else if (lower.contains("hôm qua") || lower.contains("yesterday")) {
            targetDate = now;
        } else {
            // Check for explicit "ngày X tháng Y [năm Z]"
            java.util.regex.Pattern dmyTextPat = java.util.regex.Pattern.compile(
                    "ngày\\s+(\\d{1,2})\\s+tháng\\s+(\\d{1,2})(?:\\s+năm\\s+(\\d{4}))?",
                    java.util.regex.Pattern.CASE_INSENSITIVE
            );
            java.util.regex.Matcher dmyTextMat = dmyTextPat.matcher(prompt);

            if (dmyTextMat.find()) {
                int d = Integer.parseInt(dmyTextMat.group(1));
                int m = Integer.parseInt(dmyTextMat.group(2));
                int y = dmyTextMat.group(3) != null ? Integer.parseInt(dmyTextMat.group(3)) : now.getYear();
                targetDate = java.time.LocalDate.of(y, m, d);
            } else {
                // Check for "YYYY-MM-DD"
                java.util.regex.Pattern ymdPat = java.util.regex.Pattern.compile("(\\d{4})[-/. ](\\d{1,2})[-/. ](\\d{1,2})");
                java.util.regex.Matcher ymdMat = ymdPat.matcher(prompt);
                if (ymdMat.find()) {
                    int y = Integer.parseInt(ymdMat.group(1));
                    int m = Integer.parseInt(ymdMat.group(2));
                    int d = Integer.parseInt(ymdMat.group(3));
                    targetDate = java.time.LocalDate.of(y, m, d);
                } else {
                    // Check for "DD/MM[/YYYY]"
                    java.util.regex.Pattern dmyPat = java.util.regex.Pattern.compile("(\\d{1,2})[/.-](\\d{1,2})(?:[/.-](\\d{4}))?");
                    java.util.regex.Matcher dmyMat = dmyPat.matcher(prompt);
                    if (dmyMat.find()) {
                        int d = Integer.parseInt(dmyMat.group(1));
                        int m = Integer.parseInt(dmyMat.group(2));
                        int y = dmyMat.group(3) != null ? Integer.parseInt(dmyMat.group(3)) : now.getYear();
                        targetDate = java.time.LocalDate.of(y, m, d);
                    } else {
                        // Check for standalone "ngày 21", "hôm 21", "mùng 21"
                        java.util.regex.Pattern strictDayPat = java.util.regex.Pattern.compile(
                                "(?:ngày|hôm|mùng)\\s*(\\d{1,2})\\b",
                                java.util.regex.Pattern.CASE_INSENSITIVE
                        );
                        java.util.regex.Matcher strictDayMat = strictDayPat.matcher(prompt);
                        if (strictDayMat.find()) {
                            int d = Integer.parseInt(strictDayMat.group(1));
                            if (d >= 1 && d <= 31) {
                                int m = now.getMonthValue();
                                int y = now.getYear();
                                if (d < now.getDayOfMonth()) {
                                    java.time.LocalDate nextMonthDate = now.plusMonths(1);
                                    m = nextMonthDate.getMonthValue();
                                    y = nextMonthDate.getYear();
                                }
                                int maxDay = java.time.YearMonth.of(y, m).lengthOfMonth();
                                targetDate = java.time.LocalDate.of(y, m, Math.min(d, maxDay));
                            }
                        } else {
                            // Check shorthand days: "t2", "t3", "t4", "t5", "t6", "t7", "cn", "thứ X", "chủ nhật"
                            if (lower.matches(".*\\b(t2|thứ 2|thứ hai|monday)\\b.*")) {
                                targetDate = getNextDayOfWeek(now, java.time.DayOfWeek.MONDAY);
                            } else if (lower.matches(".*\\b(t3|thứ 3|thứ ba|tuesday)\\b.*")) {
                                targetDate = getNextDayOfWeek(now, java.time.DayOfWeek.TUESDAY);
                            } else if (lower.matches(".*\\b(t4|thứ 4|thứ tư|wednesday)\\b.*")) {
                                targetDate = getNextDayOfWeek(now, java.time.DayOfWeek.WEDNESDAY);
                            } else if (lower.matches(".*\\b(t5|thứ 5|thứ năm|thursday)\\b.*")) {
                                targetDate = getNextDayOfWeek(now, java.time.DayOfWeek.THURSDAY);
                            } else if (lower.matches(".*\\b(t6|thứ 6|thứ sáu|friday)\\b.*")) {
                                targetDate = getNextDayOfWeek(now, java.time.DayOfWeek.FRIDAY);
                            } else if (lower.matches(".*\\b(t7|thứ 7|thứ bảy|saturday)\\b.*")) {
                                targetDate = getNextDayOfWeek(now, java.time.DayOfWeek.SATURDAY);
                            } else if (lower.matches(".*\\b(cn|chủ nhật|sunday)\\b.*")) {
                                targetDate = getNextDayOfWeek(now, java.time.DayOfWeek.SUNDAY);
                            }
                        }
                    }
                }
            }
        }

        // Ensure date is never in the past
        if (targetDate.isBefore(now)) {
            targetDate = now;
        }

        // 2. Parse Duration & Missing info detection
        List<String> missingFields = new ArrayList<>();
        Integer durationMinutes = null;

        // Duration patterns: "2 tiếng", "2h", "30p", "45 phút", "1.5h", "1h30"
        java.util.regex.Pattern durHourPat = java.util.regex.Pattern.compile(
                "(?:trong\\s+)?(\\d+(?:\\.\\d+)?)\\s*(?:tiếng|h|giờ)(?:\\s*(\\d{1,2})\\s*(?:p|phút))?",
                java.util.regex.Pattern.CASE_INSENSITIVE
        );
        java.util.regex.Matcher durHourMat = durHourPat.matcher(prompt);

        java.util.regex.Pattern durMinPat = java.util.regex.Pattern.compile(
                "(\\d{1,2})\\s*(?:p|phút)\\b",
                java.util.regex.Pattern.CASE_INSENSITIVE
        );
        java.util.regex.Matcher durMinMat = durMinPat.matcher(prompt);

        if (lower.contains("2 tiếng") || lower.contains("2h")) {
            durationMinutes = 120;
        } else if (lower.contains("1.5h") || lower.contains("1h30") || lower.contains("1 tiếng rưỡi") || lower.contains("1h rưỡi")) {
            durationMinutes = 90;
        } else if (lower.contains("1 tiếng") || lower.contains("1h") || lower.contains("1 giờ")) {
            // only if not part of a start time like "1h chiều"
            if (!lower.contains("1h chiều") && !lower.contains("1h trưa") && !lower.contains("1h sáng")) {
                durationMinutes = 60;
            }
        } else if (durMinMat.find()) {
            durationMinutes = Integer.parseInt(durMinMat.group(1));
        }

        // 3. Parse Time Interval & Approximate Context
        String startTime = "08:00";
        String endTime = "09:00";
        boolean hasExplicitStartTime = false;
        boolean hasExplicitEndTime = false;

        // Check for range like "từ 8h - 17h", "8h - 17h", "8-10h", "8h đến 17h", "18h tới 20h", "từ 6h30 tới 8h30 tối"
        java.util.regex.Pattern rangePat = java.util.regex.Pattern.compile(
                "(?:từ|from|khoảng)?\\s*(\\d{1,2})(?:(?:h|:|g|giờ|\\s*h\\s*|\\s*g\\s*|\\s*giờ\\s*)(\\d{1,2})(?:p|phút|m)?)?(?:h|g|giờ)?\\s*(am|pm|sáng|chiều|tối|đêm)?\\s*(?:-|–|—|đến|to|tới|\\.\\.|->)\\s*(\\d{1,2})(?:(?:h|:|g|giờ|\\s*h\\s*|\\s*g\\s*|\\s*giờ\\s*)(\\d{1,2})(?:p|phút|m)?)?(?:h|g|giờ)?\\s*(am|pm|sáng|chiều|tối|đêm)?",
                java.util.regex.Pattern.CASE_INSENSITIVE
        );
        java.util.regex.Matcher rangeMat = rangePat.matcher(prompt);

        if (rangeMat.find()) {
            int sh = Integer.parseInt(rangeMat.group(1));
            int sm = rangeMat.group(2) != null ? Integer.parseInt(rangeMat.group(2)) : 0;
            String period1 = rangeMat.group(3) != null ? rangeMat.group(3).toLowerCase() : "";
            int eh = Integer.parseInt(rangeMat.group(4));
            int em = rangeMat.group(5) != null ? Integer.parseInt(rangeMat.group(5)) : 0;
            String period2 = rangeMat.group(6) != null ? rangeMat.group(6).toLowerCase() : "";

            if (sh >= 0 && sh <= 24 && sm >= 0 && sm <= 59 && eh >= 0 && eh <= 24 && em >= 0 && em <= 59) {
                boolean isStartPm = period1.contains("pm") || period1.contains("chiều") || period1.contains("tối") || period1.contains("đêm");
                boolean isEndPm = period2.contains("pm") || period2.contains("chiều") || period2.contains("tối") || period2.contains("đêm");
                boolean generalEvening = lower.contains("tối") || lower.contains("đêm") || lower.contains("evening") || lower.contains("night");
                boolean generalAfternoon = lower.contains("chiều") || lower.contains("afternoon");

                if (isStartPm && sh < 12) sh += 12;
                if (isEndPm && eh < 12) eh += 12;

                if (!isStartPm && !period1.contains("am") && !period1.contains("sáng")) {
                    if (isEndPm || generalEvening) {
                        if (sh < 12) sh += 12;
                    } else if (generalAfternoon && sh <= 6) {
                        sh += 12;
                    }
                }
                if (!isEndPm && !period2.contains("am") && !period2.contains("sáng")) {
                    if (generalEvening && eh < 12) {
                        eh += 12;
                    } else if (generalAfternoon && eh <= 6) {
                        eh += 12;
                    }
                }

                if (sh > eh && eh < 12) {
                    eh += 12;
                }

                startTime = String.format("%02d:%02d", sh % 24, sm);
                endTime = String.format("%02d:%02d", eh % 24, em);
                hasExplicitStartTime = true;
                hasExplicitEndTime = true;
                durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
                if (durationMinutes <= 0) durationMinutes = 60;
            }
        }

        if (!hasExplicitStartTime) {
            // Check for single start time like "8h java", "7 PM", "7pm", "19h", "lúc 8h", "22h", "3h dentist", "6h30 tối"
            java.util.regex.Pattern singlePat = java.util.regex.Pattern.compile(
                    "(?:lúc|vào|at|khoảng)?\\s*(\\d{1,2})(?:(?:h|:|g|giờ|\\s*h\\s*|\\s*g\\s*|\\s*giờ\\s*)(\\d{1,2})(?:p|phút|m)?)?(?:h|g|giờ)?\\s*(am|pm|sáng|chiều|tối|đêm)?\\b",
                    java.util.regex.Pattern.CASE_INSENSITIVE
            );
            java.util.regex.Matcher singleMat = singlePat.matcher(prompt);
            if (singleMat.find()) {
                int h = Integer.parseInt(singleMat.group(1));
                int m = singleMat.group(2) != null ? Integer.parseInt(singleMat.group(2)) : 0;
                String period = singleMat.group(3) != null ? singleMat.group(3).toLowerCase() : "";

                if (h >= 0 && h <= 24 && m >= 0 && m <= 59) {
                    if ((period.contains("tối") || period.contains("đêm") || lower.contains("tối") || lower.contains("đêm")) && h < 12) {
                        h += 12;
                    } else if ((period.contains("chiều") || lower.contains("chiều")) && h <= 6) {
                        h += 12;
                    } else if (period.contains("pm") && h < 12) {
                        h += 12;
                    } else if ((lower.contains("dentist") || lower.contains("nha sĩ")) && h >= 1 && h <= 5) {
                        h += 12;
                    }

                    startTime = String.format("%02d:%02d", h % 24, m);
                    hasExplicitStartTime = true;

                    int dur = (durationMinutes != null && durationMinutes > 0) ? durationMinutes : 60;
                    int totalEndMin = (h % 24) * 60 + m + dur;
                    int endH = (totalEndMin / 60) % 24;
                    int endM = totalEndMin % 60;
                    endTime = String.format("%02d:%02d", endH, endM);
                }
            }
        }

        // Handle approximate times: "sáng", "chiều", "tối", "trưa"
        if (!hasExplicitStartTime) {
            missingFields.add("TIME");
            if (lower.contains("chiều") || lower.contains("afternoon")) {
                startTime = "14:00";
                endTime = "15:00";
            } else if (lower.contains("tối") || lower.contains("evening") || lower.contains("night")) {
                startTime = "19:00";
                endTime = "20:30";
            } else if (lower.contains("trưa") || lower.contains("noon")) {
                startTime = "11:30";
                endTime = "12:30";
            } else {
                startTime = "08:00";
                endTime = "09:00";
            }
        }

        if (durationMinutes == null && !hasExplicitEndTime) {
            missingFields.add("DURATION");
            durationMinutes = 60;
        }

        // 4. Parse Title, Category, Energy Level, Priority
        String title = "Hoạt động theo lịch";
        String detail = "Kế hoạch cá nhân được sắp xếp";
        String category = "work";
        String energyLevel = "medium";
        String priority = "Normal";
        List<TimeBlockDto.MicroStepDto> microSteps = new ArrayList<>();

        if (containsAny(lower, "công viên", "park")) {
            title = "Đi dạo công viên";
            detail = "Thư giãn ngoài trời & hít thở không khí tự nhiên";
            category = "rest";
            energyLevel = "low";
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-1", "Chuẩn bị trang phục thoải mái và nước uống", false));
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-2", "Di chuyển đến công viên và thư giãn", false));
        } else if (containsAny(lower, "cafe", "coffee", "cà phê", "caphe")) {
            title = "Đi cà phê";
            detail = "The Workshop Cafe · Nạp lại năng lượng xã hội";
            category = "social";
            energyLevel = "low";
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-1", "Chuẩn bị đồ dùng cá nhân và xác nhận địa điểm", false));
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-2", "Gặp gỡ bạn bè và tận hưởng cuộc trò chuyện", false));
        } else if (containsAny(lower, "gym", "workout", "chạy bộ", "thể dục", "fitness")) {
            title = "Tập gym / Thể dục";
            detail = "Rèn luyện thể lực & duy trì sức khỏe";
            category = "health";
            energyLevel = "medium";
            priority = "Protected";
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-1", "Thay đồ tập và chuẩn bị bình nước", false));
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-2", "Khởi động nhẹ nhàng và hoàn thành bài tập", false));
        } else if (containsAny(lower, "bơi", "swimming")) {
            title = "Đi bơi / Thể thao dưới nước";
            detail = "Rèn luyện sức bền & giải tỏa căng thẳng";
            category = "health";
            energyLevel = "medium";
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-1", "Chuẩn bị đồ bơi và kính bơi", false));
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-2", "Khởi động kỹ trước khi xuống nước", false));
        } else if (containsAny(lower, "họp", "hop", "meeting", "sync")) {
            boolean isUrgent = lower.contains("đột xuất") || lower.contains("khẩn") || lower.contains("gấp") || lower.contains("emergency") || lower.contains("urgent");
            title = isUrgent ? "Cuộc họp đột xuất" : "Cuộc họp / Trao đổi";
            detail = isUrgent ? "Cuộc họp phát sinh khẩn cấp cần ưu tiên xử lý" : "Trao đổi công việc & căn chỉnh mục tiêu";
            category = isUrgent ? "urgent" : "work";
            energyLevel = "high";
            priority = isUrgent ? "High" : "Normal";
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-1", "Chuẩn bị tài liệu & ghi chú cần trao đổi", false));
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-2", "Tham gia thảo luận và tổng kết action items", false));
        } else if (containsAny(lower, "java", "python", "coding", "lập trình", "code")) {
            title = "Học Java / Lập trình";
            detail = "Thực hành lập trình & rèn luyện tư duy kỹ thuật";
            category = "work";
            energyLevel = "medium";
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-1", "Mở IDE và xem lại mục tiêu bài tập", false));
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-2", "Tập trung code từng module nhỏ", false));
        } else if (containsAny(lower, "ngủ", "ngu", "wind down", "sleep")) {
            title = "Nghỉ ngơi / Đi ngủ";
            detail = "Thư giãn tâm trí và nạp lại năng lượng";
            category = "rest";
            energyLevel = "low";
            priority = "Protected";
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-1", "Tắt các thiết bị điện tử", false));
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-2", "Nghỉ ngơi thư giãn", false));
        } else if (containsAny(lower, "dentist", "nha sĩ", "nha si", "khám răng", "bác sĩ", "doctor")) {
            title = "Khám nha sĩ / Bác sĩ";
            detail = "Khám và chăm sóc sức khỏe theo lịch hẹn";
            category = "health";
            energyLevel = "high";
            priority = "High";
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-1", "Chuẩn bị sổ khám & đúng giờ hẹn", false));
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-2", "Hoàn thành buổi khám", false));
        } else if (containsAny(lower, "học", "hoc", "study", "đọc sách", "doc sach", "research", "bài tập", "assignment")) {
            title = "Học tập / Nghiên cứu";
            detail = "Tập trung nâng cao kiến thức";
            category = "work";
            energyLevel = "medium";
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-1", "Mở tài liệu học và loại bỏ yếu tố gây xao nhãng", false));
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-2", "Học tập tập trung theo từng phiên 25 phút", false));
        } else if (containsAny(lower, "xem phim", "movie", "cinema", "netflix")) {
            title = "Xem phim giải trí";
            detail = "Thư giãn đầu óc & thưởng thức bộ phim yêu thích";
            category = "rest";
            energyLevel = "low";
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-1", "Chọn phim và chuẩn bị chỗ ngồi thoải mái", false));
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-2", "Thưởng thức trọn vẹn bộ phim", false));
        } else if (containsAny(lower, "ăn tối", "ăn trưa", "dinner", "lunch", "ăn")) {
            title = "Bữa ăn & Thư giãn";
            detail = "Thưởng thức bữa ăn & nạp năng lượng";
            category = "rest";
            energyLevel = "low";
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-1", "Chuẩn bị bữa ăn", false));
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-2", "Ăn uống thư thái", false));
        } else {
            // General clean title
            String cleaned = prompt.replaceAll("(?i)(tôi sẽ|tôi muốn|hãy lên lịch|lên lịch|đặt lịch|nhắc tôi|vào ngày|ngày|từ|đến|tới|-|\\d{1,2}[/.-]\\d{1,2}(?:[/.-]\\d{4})?|\\d{1,2}h(?:\\d{2})?|t[2-7]|cn|mai|mốt|hôm nay)", "").trim();
            if (cleaned.length() > 2) {
                title = Character.toUpperCase(cleaned.charAt(0)) + cleaned.substring(1);
            } else {
                title = "Focused Work Session";
            }
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-1", "Chuẩn bị công việc và không gian", false));
            microSteps.add(new TimeBlockDto.MicroStepDto("ms-2", "Bắt đầu từng bước nhỏ", false));
        }

        return TimeBlockDto.builder()
                .title(title)
                .detail(detail)
                .startTime(startTime)
                .endTime(endTime)
                .category(category)
                .energyLevel(energyLevel)
                .priority(priority)
                .date(targetDate)
                .durationMinutes(durationMinutes)
                .missingFields(missingFields)
                .confidence(0.95)
                .reminderMinutesBefore(List.of(30, 10, 0))
                .isCompleted(false)
                .isBufferBlock(false)
                .microSteps(microSteps)
                .build();
    }

    private RescheduleResponseDto fallbackGenerateScenarios(RescheduleRequest request) {
        List<TimeBlockDto> base = request.getCurrentBlocks() != null && !request.getCurrentBlocks().isEmpty()
                ? new ArrayList<>(request.getCurrentBlocks())
                : timeBlockService.getAllBlocks();

        String startTime = request.getTargetTime() != null ? request.getTargetTime() : "17:00";
        int dur = request.getDurationMinutes() != null && request.getDurationMinutes() > 0 ? request.getDurationMinutes() : 60;
        String[] parts = startTime.split(":");
        int sh = Integer.parseInt(parts[0]);
        int sm = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
        int urgentStartMin = sh * 60 + sm;
        int endTotalMin = urgentStartMin + dur;
        String endTime = String.format("%02d:%02d", (endTotalMin / 60) % 24, endTotalMin % 60);

        String eventTitle = request.getUrgentEvent() != null ? request.getUrgentEvent() : "Cuộc họp đột xuất";
        java.time.LocalDate today = java.time.LocalDate.now();

        TimeBlockDto urgentBlock = TimeBlockDto.builder()
                .id("block-urgent-" + System.currentTimeMillis())
                .title(eventTitle)
                .detail("Sự kiện khẩn cấp được ưu tiên xếp vào lịch")
                .startTime(startTime)
                .endTime(endTime)
                .category("urgent")
                .energyLevel("high")
                .priority("HIGH")
                .isMovable(false)
                .status("ACTIVE")
                .date(today)
                .reminderMinutesBefore(List.of(15, 0))
                .isCompleted(false)
                .build();

        List<TimeBlockDto> sortedBase = new ArrayList<>(base);
        sortedBase.sort((a, b) -> (a.getStartTime() != null ? a.getStartTime() : "").compareTo(b.getStartTime() != null ? b.getStartTime() : ""));

        // Bedtime cutoff: 22:30 (Sleep 23:00-07:00 is PROTECTED)
        int bedtimeCutoffMin = 22 * 60 + 30;

        List<TimeBlockDto> recommendedBlocks = new ArrayList<>();
        List<String> reasons = new ArrayList<>();
        List<String> deferredTitles = new ArrayList<>();
        List<String> shiftedTitles = new ArrayList<>();

        int rippleCursorMin = endTotalMin + 15; // 15m buffer after urgent event

        for (TimeBlockDto b : sortedBase) {
            if (b.getStartTime() == null || b.getEndTime() == null) continue;
            try {
                String[] bStartParts = b.getStartTime().split(":");
                int bStartMin = Integer.parseInt(bStartParts[0]) * 60 + (bStartParts.length > 1 ? Integer.parseInt(bStartParts[1]) : 0);
                String[] bEndParts = b.getEndTime().split(":");
                int bEndMin = Integer.parseInt(bEndParts[0]) * 60 + (bEndParts.length > 1 ? Integer.parseInt(bEndParts[1]) : 0);
                int bDur = Math.max(30, bEndMin - bStartMin);

                // If block ends before urgent event starts, it's untouched
                if (bEndMin <= urgentStartMin) {
                    recommendedBlocks.add(b);
                    continue;
                }

                // Check if block is PROTECTED (Sleep, Dinner, etc.)
                boolean isProtected = "PROTECTED".equalsIgnoreCase(b.getPriority()) ||
                        Boolean.FALSE.equals(b.getIsMovable()) ||
                        "rest".equalsIgnoreCase(b.getCategory()) && b.getTitle().toLowerCase().contains("ngủ");

                // Check deadline urgency
                boolean hasTodayDeadline = b.getDeadline() != null && !b.getDeadline().isBlank();

                if (isProtected) {
                    recommendedBlocks.add(b);
                    reasons.add("Bảo vệ tuyệt đối khung giờ cố định/nghỉ ngơi: " + b.getTitle());
                    continue;
                }

                // Shift calculation
                int newStartMin = Math.max(bStartMin, rippleCursorMin);
                int newEndMin = newStartMin + bDur;

                // Check bedtime violation
                if (newEndMin > bedtimeCutoffMin && !hasTodayDeadline) {
                    // Defer to Tomorrow Inbox to defend sleep boundary
                    deferredTitles.add(b.getTitle());
                    TimeBlockDto deferred = TimeBlockDto.builder()
                            .id(b.getId() != null ? b.getId() : "def-" + System.currentTimeMillis())
                            .title(b.getTitle())
                            .detail(b.getDetail())
                            .startTime(b.getStartTime())
                            .endTime(b.getEndTime())
                            .category(b.getCategory())
                            .energyLevel(b.getEnergyLevel())
                            .priority(b.getPriority())
                            .deadline(b.getDeadline())
                            .status("DEFERRED")
                            .inboxDate(today.plusDays(1))
                            .sourceType("AI_RESCHEDULED")
                            .isCompleted(false)
                            .build();
                    // We don't add deferred block to today's active timeline, but stage it
                    continue;
                }

                // Apply ripple shift
                String newBStart = String.format("%02d:%02d", (newStartMin / 60) % 24, newStartMin % 60);
                String newBEnd = String.format("%02d:%02d", (newEndMin / 60) % 24, newEndMin % 60);
                rippleCursorMin = newEndMin + 15; // 15m buffer

                shiftedTitles.add(b.getTitle() + " (" + newBStart + "–" + newBEnd + ")");

                recommendedBlocks.add(TimeBlockDto.builder()
                        .id(b.getId() != null ? b.getId() : "b-" + System.currentTimeMillis())
                        .title(b.getTitle())
                        .detail(b.getDetail())
                        .startTime(newBStart)
                        .endTime(newBEnd)
                        .category(b.getCategory())
                        .energyLevel(b.getEnergyLevel())
                        .priority(b.getPriority())
                        .deadline(b.getDeadline())
                        .status("ACTIVE")
                        .reminderMinutesBefore(b.getReminderMinutesBefore())
                        .isCompleted(b.isCompleted())
                        .date(b.getDate())
                        .sourceType("AI_RESCHEDULED")
                        .build());

            } catch (Exception ex) {
                recommendedBlocks.add(b);
            }
        }

        recommendedBlocks.add(urgentBlock);
        recommendedBlocks.sort((a, b) -> a.getStartTime().compareTo(b.getStartTime()));

        // Assemble Smart Reasons
        reasons.add("Bảo vệ tuyệt đối giờ ngủ (23:00–07:00) và các block Protected.");
        if (!shiftedTitles.isEmpty()) {
            reasons.add("Tự động dời " + String.join(", ", shiftedTitles) + " kèm 15m đệm chuyển tiếp.");
        }
        if (!deferredTitles.isEmpty()) {
            reasons.add("Hoãn " + String.join(", ", deferredTitles) + " sang Tomorrow Inbox để không làm việc đêm muộn.");
        }

        ExplanationDetailsDto explanation = ExplanationDetailsDto.builder()
                .whatChanged(eventTitle + " (" + startTime + "–" + endTime + ") gây trùng lặp với lịch trình buổi tối.")
                .whatWillHappen(!shiftedTitles.isEmpty() ? "Dời các hoạt động linh hoạt sang slot sau " + endTime + " và chèn 15m đệm." : "Tối ưu hóa lịch trình và bảo toàn giờ nghỉ ngơi.")
                .reasons(reasons)
                .confidenceLevel(0.96)
                .build();

        ScenarioDto recommended = ScenarioDto.builder()
                .id("recommended")
                .title("✦ Điều chỉnh thông minh (Khuyến nghị)")
                .description("Phương án tối ưu: xếp " + eventTitle + ", trượt các task liên quan và giữ vững giờ ngủ.")
                .energyImpact("medium")
                .highlightText("Bảo toàn năng lượng và hạn chót mà không gây quá tải.")
                .tag("Optimized")
                .blocks(recommendedBlocks)
                .build();

        // Alternative 1: Cascade shift everything
        List<TimeBlockDto> altCascadeBlocks = new ArrayList<>();
        int altRippleMin = endTotalMin + 15;
        for (TimeBlockDto b : sortedBase) {
            if (b.getStartTime() == null || b.getEndTime() == null) continue;
            try {
                String[] bStartParts = b.getStartTime().split(":");
                int bStartMin = Integer.parseInt(bStartParts[0]) * 60 + (bStartParts.length > 1 ? Integer.parseInt(bStartParts[1]) : 0);
                String[] bEndParts = b.getEndTime().split(":");
                int bEndMin = Integer.parseInt(bEndParts[0]) * 60 + (bEndParts.length > 1 ? Integer.parseInt(bEndParts[1]) : 0);
                int bDur = Math.max(30, bEndMin - bStartMin);

                if (bEndMin <= urgentStartMin) {
                    altCascadeBlocks.add(b);
                    continue;
                }

                String newBStart = String.format("%02d:%02d", (altRippleMin / 60) % 24, altRippleMin % 60);
                int newBEndMin = altRippleMin + bDur;
                String newBEnd = String.format("%02d:%02d", (newBEndMin / 60) % 24, newBEndMin % 60);
                altRippleMin = newBEndMin + 15;

                altCascadeBlocks.add(TimeBlockDto.builder()
                        .id(b.getId() != null ? b.getId() : "b-" + System.currentTimeMillis())
                        .title(b.getTitle())
                        .detail(b.getDetail())
                        .startTime(newBStart)
                        .endTime(newBEnd)
                        .category(b.getCategory())
                        .energyLevel(b.getEnergyLevel())
                        .priority(b.getPriority())
                        .deadline(b.getDeadline())
                        .status("ACTIVE")
                        .reminderMinutesBefore(b.getReminderMinutesBefore())
                        .isCompleted(b.isCompleted())
                        .date(b.getDate())
                        .sourceType("AI_RESCHEDULED")
                        .build());
            } catch (Exception ex) {
                altCascadeBlocks.add(b);
            }
        }
        altCascadeBlocks.add(urgentBlock);
        altCascadeBlocks.sort((a, b) -> a.getStartTime().compareTo(b.getStartTime()));

        ScenarioDto altCascade = ScenarioDto.builder()
                .id("alt_cascade")
                .title("Dời toàn bộ về sau (Cascade Shift)")
                .description("Trượt toàn bộ công việc bị trùng sang khung giờ muộn hơn kèm 15m đệm.")
                .energyImpact("medium")
                .highlightText("Giữ trọn vẹn 100% công việc trong ngày.")
                .tag("Alternative")
                .blocks(altCascadeBlocks)
                .build();

        // Alternative 2: Defer all overlapping to Tomorrow
        List<TimeBlockDto> altDeferBlocks = new ArrayList<>();
        for (TimeBlockDto b : sortedBase) {
            if (b.getStartTime() == null || b.getEndTime() == null) continue;
            try {
                String[] bStartParts = b.getStartTime().split(":");
                int bStartMin = Integer.parseInt(bStartParts[0]) * 60 + (bStartParts.length > 1 ? Integer.parseInt(bStartParts[1]) : 0);
                String[] bEndParts = b.getEndTime().split(":");
                int bEndMin = Integer.parseInt(bEndParts[0]) * 60 + (bEndParts.length > 1 ? Integer.parseInt(bEndParts[1]) : 0);
                if (Math.max(urgentStartMin, bStartMin) >= Math.min(endTotalMin, bEndMin)) {
                    altDeferBlocks.add(b);
                }
            } catch (Exception ex) {
                altDeferBlocks.add(b);
            }
        }
        altDeferBlocks.add(urgentBlock);
        altDeferBlocks.sort((a, b) -> a.getStartTime().compareTo(b.getStartTime()));

        ScenarioDto altDefer = ScenarioDto.builder()
                .id("alt_defer")
                .title("Zero-Guilt / Tạm hoãn sang ngày mai")
                .description("Tạm hoãn các hoạt động bị trùng sang Tomorrow Inbox để dồn tâm trí cho " + eventTitle + ".")
                .energyImpact("low")
                .highlightText("Bảo vệ năng lượng nhận thức, không cảm thấy có lỗi.")
                .tag("Low-Demand")
                .blocks(altDeferBlocks)
                .build();

        return RescheduleResponseDto.builder()
                .analysis("Sự kiện " + eventTitle + " (" + startTime + "–" + endTime + ") gây trùng lặp với lịch trình hiện tại. Hệ thống đã chuẩn bị phương án điều chỉnh tối ưu nhất:")
                .recommendedScenario(recommended)
                .alternativeScenarios(List.of(altCascade, altDefer))
                .explanation(explanation)
                .scenarios(List.of(recommended, altCascade, altDefer))
                .build();
    }

    private TaskBreakdownResponseDto fallbackTaskBreakdown(String taskTitle) {
        String lower = taskTitle != null ? taskTitle.toLowerCase() : "";
        List<TimeBlockDto.MicroStepDto> steps;

        if (containsAny(lower, "gym", "tập", "thể thao", "chạy", "workout")) {
            steps = List.of(
                    new TimeBlockDto.MicroStepDto("ms-1", "Uống một cốc nước và thay trang phục thể thao (2 phút)", false),
                    new TimeBlockDto.MicroStepDto("ms-2", "Chuẩn bị bình nước và giày tập (1 phút)", false),
                    new TimeBlockDto.MicroStepDto("ms-3", "Khởi động nhẹ xoay khớp 3 phút", false)
            );
        } else if (containsAny(lower, "báo cáo", "report", "viết", "write", "doc", "tài liệu")) {
            steps = List.of(
                    new TimeBlockDto.MicroStepDto("ms-1", "Mở tài liệu và ghi tiêu đề cho \"" + taskTitle + "\" (1 phút)", false),
                    new TimeBlockDto.MicroStepDto("ms-2", "Gạch 3 ý chính cần trình bày (3 phút)", false),
                    new TimeBlockDto.MicroStepDto("ms-3", "Viết 2 câu tóm tắt mở đầu (5 phút)", false)
            );
        } else if (containsAny(lower, "học", "study", "ôn", "đọc", "read", "sách")) {
            steps = List.of(
                    new TimeBlockDto.MicroStepDto("ms-1", "Dọn gọn bàn học và mở trang tài liệu đầu tiên (2 phút)", false),
                    new TimeBlockDto.MicroStepDto("ms-2", "Đọc lướt qua tiêu đề và mục lục (3 phút)", false),
                    new TimeBlockDto.MicroStepDto("ms-3", "Đọc tập trung phần mở đầu trong 5 phút", false)
            );
        } else if (containsAny(lower, "code", "java", "dev", "bug", "fix", "lập trình", "web")) {
            steps = List.of(
                    new TimeBlockDto.MicroStepDto("ms-1", "Mở IDE và chuẩn bị workspace cho \"" + taskTitle + "\" (2 phút)", false),
                    new TimeBlockDto.MicroStepDto("ms-2", "Xác định file code hoặc hàm cần xử lý đầu tiên (2 phút)", false),
                    new TimeBlockDto.MicroStepDto("ms-3", "Viết 5 dòng code hoặc test case đầu tiên (5 phút)", false)
            );
        } else {
            steps = List.of(
                    new TimeBlockDto.MicroStepDto("ms-1", "Mở không gian làm việc và chuẩn bị cho \"" + taskTitle + "\" (2 phút)", false),
                    new TimeBlockDto.MicroStepDto("ms-2", "Gạch đầu dòng 3 việc nhỏ cần làm (2 phút)", false),
                    new TimeBlockDto.MicroStepDto("ms-3", "Bắt đầu làm việc nhỏ nhất trong 5 phút đầu tiên", false)
            );
        }

        return TaskBreakdownResponseDto.builder()
                .microSteps(steps)
                .build();
    }

    private boolean containsAny(String source, String... keywords) {
        if (source == null || keywords == null) return false;
        for (String kw : keywords) {
            if (source.contains(kw)) {
                return true;
            }
        }
        return false;
    }

    private java.time.LocalDate getNextDayOfWeek(java.time.LocalDate from, java.time.DayOfWeek targetDay) {
        int diff = targetDay.getValue() - from.getDayOfWeek().getValue();
        if (diff <= 0) {
            diff += 7;
        }
        return from.plusDays(diff);
    }
}
