package com.adaptive.planner.service;

import com.adaptive.planner.dto.CreateWeeklyRoutineRequest;
import com.adaptive.planner.dto.WeeklyRoutineDto;
import com.adaptive.planner.entity.WeeklyRoutineEntity;
import com.adaptive.planner.exception.ResourceNotFoundException;
import com.adaptive.planner.repository.WeeklyRoutineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeeklyRoutineService {

    private final WeeklyRoutineRepository routineRepository;

    @Transactional(readOnly = true)
    public List<WeeklyRoutineDto> getAllRoutines() {
        return routineRepository.findAllByOrderByDayOfWeekAscStartTimeAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WeeklyRoutineDto> getActiveRoutinesForDay(DayOfWeek dayOfWeek) {
        return routineRepository.findByDayOfWeekAndEnabledTrueOrderByStartTimeAsc(dayOfWeek).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<WeeklyRoutineDto> createRoutines(CreateWeeklyRoutineRequest request) {
        // Validate time format & order
        validateTimeOrder(request.getStartTime(), request.getEndTime());

        List<WeeklyRoutineDto> created = new ArrayList<>();
        String reminders = (request.getReminderMinutesBefore() != null)
                ? request.getReminderMinutesBefore().stream().map(String::valueOf).collect(Collectors.joining(","))
                : "30,10,0";

        for (DayOfWeek day : request.getDaysOfWeek()) {
            List<WeeklyRoutineEntity> existing = routineRepository.findByDayOfWeekOrderByStartTimeAsc(day);

            // Kiểm tra trùng lặp chính xác (Exact Duplicate Check)
            boolean duplicateExists = existing.stream().anyMatch(e ->
                    e.getStartTime().equals(request.getStartTime()) &&
                    e.getEndTime().equals(request.getEndTime()) &&
                    e.getTitle().trim().equalsIgnoreCase(request.getTitle().trim())
            );

            if (duplicateExists) {
                log.info("Skipping duplicate routine for {} from {} to {}", day, request.getStartTime(), request.getEndTime());
                continue;
            }

            WeeklyRoutineEntity entity = WeeklyRoutineEntity.builder()
                    .dayOfWeek(day)
                    .title(request.getTitle().trim())
                    .detail(request.getDetail() != null ? request.getDetail().trim() : null)
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .category(request.getCategory())
                    .energyLevel(request.getEnergyLevel())
                    .priority(request.getPriority() != null ? request.getPriority() : "Normal")
                    .reminderMinutes(reminders)
                    .enabled(true)
                    .build();

            WeeklyRoutineEntity saved = routineRepository.save(entity);
            created.add(toDto(saved));
        }
        return created;
    }

    @Transactional
    public List<WeeklyRoutineDto> updateRoutineWithScope(Long id, WeeklyRoutineDto updates, boolean updateAllMatching) {
        WeeklyRoutineEntity existing = routineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + id));

        String startTime = updates.getStartTime() != null ? updates.getStartTime() : existing.getStartTime();
        String endTime = updates.getEndTime() != null ? updates.getEndTime() : existing.getEndTime();
        validateTimeOrder(startTime, endTime);

        String originalTitle = existing.getTitle();
        List<WeeklyRoutineDto> results = new ArrayList<>();

        if (updateAllMatching) {
            List<WeeklyRoutineEntity> matching = routineRepository.findByTitleIgnoreCase(originalTitle);
            for (WeeklyRoutineEntity target : matching) {
                if (updates.getTitle() != null) target.setTitle(updates.getTitle().trim());
                if (updates.getDetail() != null) target.setDetail(updates.getDetail().trim());
                target.setStartTime(startTime);
                target.setEndTime(endTime);
                if (updates.getCategory() != null) target.setCategory(updates.getCategory());
                if (updates.getEnergyLevel() != null) target.setEnergyLevel(updates.getEnergyLevel());
                if (updates.getPriority() != null) target.setPriority(updates.getPriority());
                if (updates.getReminderMinutesBefore() != null) {
                    target.setReminderMinutes(updates.getReminderMinutesBefore().stream()
                            .map(String::valueOf).collect(Collectors.joining(",")));
                }
                results.add(toDto(routineRepository.save(target)));
            }
        } else {
            if (updates.getTitle() != null) existing.setTitle(updates.getTitle().trim());
            if (updates.getDetail() != null) existing.setDetail(updates.getDetail().trim());
            existing.setStartTime(startTime);
            existing.setEndTime(endTime);
            if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
            if (updates.getEnergyLevel() != null) existing.setEnergyLevel(updates.getEnergyLevel());
            if (updates.getPriority() != null) existing.setPriority(updates.getPriority());
            if (updates.getDayOfWeek() != null) existing.setDayOfWeek(updates.getDayOfWeek());
            if (updates.getReminderMinutesBefore() != null) {
                existing.setReminderMinutes(updates.getReminderMinutesBefore().stream()
                        .map(String::valueOf).collect(Collectors.joining(",")));
            }
            results.add(toDto(routineRepository.save(existing)));
        }

        return results;
    }

    @Transactional
    public WeeklyRoutineDto updateRoutine(Long id, WeeklyRoutineDto updates) {
        return updateRoutineWithScope(id, updates, false).getFirst();
    }

    @Transactional
    public WeeklyRoutineDto toggleRoutine(Long id) {
        WeeklyRoutineEntity existing = routineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + id));
        existing.setEnabled(!Boolean.TRUE.equals(existing.getEnabled()));
        return toDto(routineRepository.save(existing));
    }

    @Transactional
    public void deleteRoutine(Long id) {
        if (!routineRepository.existsById(id)) {
            throw new ResourceNotFoundException("Routine not found with id: " + id);
        }
        routineRepository.deleteById(id);
    }

    /**
     * Sao chép toàn bộ thời khóa biểu từ 1 thứ (ví dụ Thứ 6) sang các thứ khác (ví dụ Thứ 7, Chủ Nhật)
     */
    @Transactional
    public List<WeeklyRoutineDto> copyDayRoutines(DayOfWeek fromDay, List<DayOfWeek> toDays, boolean overwrite) {
        List<WeeklyRoutineEntity> sourceRoutines = routineRepository.findByDayOfWeekOrderByStartTimeAsc(fromDay);
        List<WeeklyRoutineDto> copied = new ArrayList<>();

        for (DayOfWeek targetDay : toDays) {
            if (targetDay == fromDay) continue;

            if (overwrite) {
                List<WeeklyRoutineEntity> existing = routineRepository.findByDayOfWeekOrderByStartTimeAsc(targetDay);
                routineRepository.deleteAll(existing);
            }

            List<WeeklyRoutineEntity> currentTargets = routineRepository.findByDayOfWeekOrderByStartTimeAsc(targetDay);

            for (WeeklyRoutineEntity src : sourceRoutines) {
                boolean duplicate = currentTargets.stream().anyMatch(t ->
                        t.getStartTime().equals(src.getStartTime()) &&
                        t.getEndTime().equals(src.getEndTime()) &&
                        t.getTitle().trim().equalsIgnoreCase(src.getTitle().trim())
                );

                if (!duplicate) {
                    WeeklyRoutineEntity clone = WeeklyRoutineEntity.builder()
                            .dayOfWeek(targetDay)
                            .title(src.getTitle())
                            .detail(src.getDetail())
                            .startTime(src.getStartTime())
                            .endTime(src.getEndTime())
                            .category(src.getCategory())
                            .energyLevel(src.getEnergyLevel())
                            .priority(src.getPriority())
                            .reminderMinutes(src.getReminderMinutes())
                            .enabled(src.getEnabled())
                            .build();

                    WeeklyRoutineEntity saved = routineRepository.save(clone);
                    copied.add(toDto(saved));
                }
            }
        }
        return copied;
    }

    /**
     * Sao chép 1 routine task duy nhất sang các thứ khác
     */
    @Transactional
    public List<WeeklyRoutineDto> copyRoutineToDays(Long routineId, List<DayOfWeek> targetDays) {
        WeeklyRoutineEntity src = routineRepository.findById(routineId)
                .orElseThrow(() -> new ResourceNotFoundException("Routine not found with id: " + routineId));

        List<WeeklyRoutineDto> created = new ArrayList<>();
        for (DayOfWeek day : targetDays) {
            if (day == src.getDayOfWeek()) continue;

            List<WeeklyRoutineEntity> existing = routineRepository.findByDayOfWeekOrderByStartTimeAsc(day);
            boolean duplicate = existing.stream().anyMatch(t ->
                    t.getStartTime().equals(src.getStartTime()) &&
                    t.getEndTime().equals(src.getEndTime()) &&
                    t.getTitle().trim().equalsIgnoreCase(src.getTitle().trim())
            );

            if (!duplicate) {
                WeeklyRoutineEntity clone = WeeklyRoutineEntity.builder()
                        .dayOfWeek(day)
                        .title(src.getTitle())
                        .detail(src.getDetail())
                        .startTime(src.getStartTime())
                        .endTime(src.getEndTime())
                        .category(src.getCategory())
                        .energyLevel(src.getEnergyLevel())
                        .priority(src.getPriority())
                        .reminderMinutes(src.getReminderMinutes())
                        .enabled(src.getEnabled())
                        .build();

                WeeklyRoutineEntity saved = routineRepository.save(clone);
                created.add(toDto(saved));
            }
        }
        return created;
    }

    private void validateTimeOrder(String startTime, String endTime) {
        if (startTime == null || endTime == null) return;
        int startMin = parseTimeToMinutes(startTime);
        int endMin = parseTimeToMinutes(endTime);
        if (endMin <= startMin) {
            throw new IllegalArgumentException("Giờ kết thúc (" + endTime + ") phải sau giờ bắt đầu (" + startTime + ")");
        }
    }

    private int parseTimeToMinutes(String time) {
        try {
            String[] parts = time.split(":");
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (Exception e) {
            throw new IllegalArgumentException("Định dạng giờ không hợp lệ: " + time);
        }
    }

    public WeeklyRoutineDto toDto(WeeklyRoutineEntity entity) {
        List<Integer> reminders = new ArrayList<>();
        if (entity.getReminderMinutes() != null && !entity.getReminderMinutes().isBlank()) {
            reminders = Arrays.stream(entity.getReminderMinutes().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
        }

        return WeeklyRoutineDto.builder()
                .id(entity.getId())
                .dayOfWeek(entity.getDayOfWeek())
                .title(entity.getTitle())
                .detail(entity.getDetail())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .category(entity.getCategory())
                .energyLevel(entity.getEnergyLevel())
                .priority(entity.getPriority())
                .reminderMinutesBefore(reminders)
                .enabled(Boolean.TRUE.equals(entity.getEnabled()))
                .build();
    }
}
