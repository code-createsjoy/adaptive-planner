package com.adaptive.planner.service;

import com.adaptive.planner.dto.CalmSlotDto;
import com.adaptive.planner.dto.TimeBlockDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CalmSlotService {

    private final TimeBlockService timeBlockService;

    /**
     * Finds Calm Openings on targetDate for a given duration and category.
     */
    public List<CalmSlotDto> findCalmOpenings(LocalDate targetDate, int durationMinutes, String category, String energyLevel) {
        if (targetDate == null) {
            targetDate = LocalDate.now().plusDays(1);
        }
        if (durationMinutes <= 0) {
            durationMinutes = 60;
        }

        List<TimeBlockDto> existingBlocks = timeBlockService.getBlocksForDate(targetDate);
        List<TimeBlockDto> activeBlocks = existingBlocks.stream()
                .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getOverrideType()))
                .filter(b -> !"DEFERRED".equalsIgnoreCase(b.getStatus()))
                .sorted(Comparator.comparing(TimeBlockDto::getStartTime))
                .toList();

        List<CalmSlotDto> calmSlots = new ArrayList<>();

        // Usable daily awake window: 07:30 to 22:30 (450m to 1350m)
        int dayStartMin = 7 * 60 + 30; // 07:30
        int dayEndMin = 22 * 60 + 0;   // 22:00

        int currentCursor = dayStartMin;

        for (int i = 0; i < activeBlocks.size(); i++) {
            TimeBlockDto block = activeBlocks.get(i);
            int blockStart = parseTimeToMinutes(block.getStartTime());
            int blockEnd = parseTimeToMinutes(block.getEndTime());

            // Gap between currentCursor and blockStart
            int availableGap = blockStart - currentCursor;

            if (availableGap >= durationMinutes + 20) { // Require at least 20 min buffer
                // Propose a slot within this gap with 10m buffer after cursor
                int slotStartMin = currentCursor + 10;
                int slotEndMin = slotStartMin + durationMinutes;

                if (slotEndMin + 10 <= blockStart) {
                    CalmSlotDto slot = evaluateSlotQuality(slotStartMin, slotEndMin, durationMinutes, activeBlocks, i - 1, i);
                    if (slot != null) {
                        calmSlots.add(slot);
                    }
                }
            }

            currentCursor = Math.max(currentCursor, blockEnd);
        }

        // Check gap after last block until dayEndMin
        if (dayEndMin - currentCursor >= durationMinutes + 20) {
            int slotStartMin = currentCursor + 10;
            int slotEndMin = slotStartMin + durationMinutes;
            if (slotEndMin <= dayEndMin) {
                CalmSlotDto slot = evaluateSlotQuality(slotStartMin, slotEndMin, durationMinutes, activeBlocks, activeBlocks.size() - 1, -1);
                if (slot != null) {
                    calmSlots.add(slot);
                }
            }
        }

        // Sort by calm score descending
        calmSlots.sort(Comparator.comparingDouble(CalmSlotDto::getCalmScore).reversed());

        if (!calmSlots.isEmpty()) {
            calmSlots.get(0).setRecommended(true);
        }

        return calmSlots;
    }

    private CalmSlotDto evaluateSlotQuality(int startMin, int endMin, int duration, List<TimeBlockDto> blocks, int prevIdx, int nextIdx) {
        String startTime = formatMinutesToTime(startMin);
        String endTime = formatMinutesToTime(endMin);

        // Filter out sleep / late night
        if (endMin > 22 * 60 + 30 || startMin < 7 * 60) {
            return null;
        }

        double score = 1.0;
        List<String> reasons = new ArrayList<>();

        // Meal windows penalties (12:00-13:00, 18:00-19:00)
        boolean overlapsLunch = Math.max(startMin, 12 * 60) < Math.min(endMin, 13 * 60);
        boolean overlapsDinner = Math.max(startMin, 18 * 60) < Math.min(endMin, 19 * 60);

        if (overlapsLunch || overlapsDinner) {
            score -= 0.4;
            reasons.add("Gần khung giờ ăn uống");
        }

        // Check focus stacking: If preceded or followed by high energy work
        if (prevIdx >= 0 && prevIdx < blocks.size()) {
            TimeBlockDto prev = blocks.get(prevIdx);
            if ("high".equalsIgnoreCase(prev.getEnergyLevel()) && "work".equalsIgnoreCase(prev.getCategory())) {
                score -= 0.2;
                reasons.add("Sau phiên làm việc cường độ cao");
            }
        }
        if (nextIdx >= 0 && nextIdx < blocks.size()) {
            TimeBlockDto next = blocks.get(nextIdx);
            if ("high".equalsIgnoreCase(next.getEnergyLevel()) && "work".equalsIgnoreCase(next.getCategory())) {
                score -= 0.2;
                reasons.add("Trước phiên làm việc cường độ cao");
            }
        }

        // Favorable calm windows: 09:30-11:30 or 13:30-16:30
        if (startMin >= 9 * 60 + 30 && endMin <= 12 * 60) {
            score += 0.2;
            reasons.add("Khung giờ sáng thông thoáng, tinh thần minh mẫn");
        } else if (startMin >= 13 * 60 + 30 && endMin <= 16 * 60 + 30) {
            score += 0.2;
            reasons.add("Khoảng trống êm ả buổi chiều sau giờ nghỉ trưa");
        } else {
            reasons.add("Khung thời gian trống có đệm chuyển tiếp đầy đủ");
        }

        score = Math.max(0.1, Math.min(1.0, score));

        return CalmSlotDto.builder()
                .startTime(startTime)
                .endTime(endTime)
                .durationMinutes(duration)
                .calmScore(Math.round(score * 100.0) / 100.0)
                .reason(String.join(", ", reasons))
                .isRecommended(false)
                .build();
    }

    private int parseTimeToMinutes(String timeStr) {
        if (timeStr == null || !timeStr.contains(":")) return 0;
        String[] parts = timeStr.split(":");
        try {
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private String formatMinutesToTime(int totalMinutes) {
        int h = (totalMinutes / 60) % 24;
        int m = totalMinutes % 60;
        return String.format("%02d:%02d", h, m);
    }
}
