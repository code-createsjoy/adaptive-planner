package com.adaptive.planner.service;

import com.adaptive.planner.dto.CreateTimeBlockRequest;
import com.adaptive.planner.dto.HolidayDto;
import com.adaptive.planner.dto.TimeBlockDto;
import com.adaptive.planner.dto.WeeklyRoutineDto;
import com.adaptive.planner.entity.TimeBlockEntity;
import com.adaptive.planner.exception.ResourceNotFoundException;
import com.adaptive.planner.repository.TimeBlockRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimeBlockService {

    private final TimeBlockRepository repository;
    private final WeeklyRoutineService weeklyRoutineService;
    private final HolidayService holidayService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<TimeBlockDto> getAllBlocks() {
        return repository.findAllByOrderByStartTimeAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimeBlockDto> getBlocksForDate(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        // 1. Lấy tất cả WeeklyRoutine đang bật cho thứ này
        List<WeeklyRoutineDto> activeRoutines = weeklyRoutineService.getActiveRoutinesForDay(date.getDayOfWeek());

        // 2. Lấy tất cả TimeBlock thực tế đã lưu trong DB cho ngày này
        List<TimeBlockEntity> dateEntities = repository.findByDateOrderByStartTimeAsc(date);
        Map<Long, TimeBlockEntity> routineOverrideMap = new HashMap<>();
        List<TimeBlockEntity> customBlocks = new ArrayList<>();

        for (TimeBlockEntity entity : dateEntities) {
            if (entity.getSourceRoutineId() != null) {
                routineOverrideMap.put(entity.getSourceRoutineId(), entity);
            } else {
                customBlocks.add(entity);
            }
        }

        List<TimeBlockDto> result = new ArrayList<>();

        // 3. Xử lý các Routine
        for (WeeklyRoutineDto routine : activeRoutines) {
            TimeBlockEntity override = routineOverrideMap.get(routine.getId());
            if (override != null) {
                if ("CANCELLED".equalsIgnoreCase(override.getOverrideType())) {
                    // Task này bị hủy riêng cho ngày hôm nay -> bỏ qua
                    continue;
                } else {
                    // Task này bị chỉnh sửa riêng cho ngày hôm nay -> dùng bản đã sửa
                    result.add(toDto(override));
                }
            } else {
                // Chưa có override -> Chiếu từ Weekly Routine template gốc
                result.add(TimeBlockDto.builder()
                        .id("routine-" + routine.getId() + "-" + date)
                        .title(routine.getTitle())
                        .detail(routine.getDetail())
                        .startTime(routine.getStartTime())
                        .endTime(routine.getEndTime())
                        .category(routine.getCategory())
                        .energyLevel(routine.getEnergyLevel())
                        .priority(routine.getPriority())
                        .reminderMinutesBefore(routine.getReminderMinutesBefore())
                        .isCompleted(false)
                        .isBufferBlock(false)
                        .microSteps(new ArrayList<>())
                        .date(date)
                        .sourceType("ROUTINE")
                        .sourceRoutineId(routine.getId())
                        .overrideType("NONE")
                        .build());
            }
        }

        // 4. Thêm các Custom / AI TimeBlock của riêng ngày hôm nay
        for (TimeBlockEntity custom : customBlocks) {
            result.add(toDto(custom));
        }

        // 5. Sắp xếp theo startTime tăng dần
        result.sort(Comparator.comparing(TimeBlockDto::getStartTime, Comparator.nullsLast(String::compareTo)));

        return result;
    }

    @Transactional(readOnly = true)
    public TimeBlockDto getBlockById(Long id) {
        TimeBlockEntity entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimeBlock not found with id: " + id));
        return toDto(entity);
    }

    @Transactional
    public TimeBlockDto createBlock(CreateTimeBlockRequest request) {
        LocalDate blockDate = request.getDate() != null ? request.getDate() : LocalDate.now();

        TimeBlockDto dto = TimeBlockDto.builder()
                .title(request.getTitle())
                .detail(request.getDetail())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .category(request.getCategory())
                .energyLevel(request.getEnergyLevel())
                .priority(request.getPriority() != null ? request.getPriority() : "Normal")
                .deadline(request.getDeadline())
                .isMovable(request.getIsMovable() != null ? request.getIsMovable() : true)
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .inboxDate(request.getInboxDate())
                .preferredTimeRange(request.getPreferredTimeRange())
                .reminderMinutesBefore(request.getReminderMinutesBefore() != null ? request.getReminderMinutesBefore() : List.of(30, 10, 0))
                .isBufferBlock(request.getIsBufferBlock() != null ? request.getIsBufferBlock() : false)
                .isCompleted(false)
                .microSteps(request.getMicroSteps() != null ? request.getMicroSteps() : new ArrayList<>())
                .date(blockDate)
                .sourceType(request.getSourceType() != null ? request.getSourceType() : "CUSTOM")
                .sourceRoutineId(request.getSourceRoutineId())
                .overrideType(request.getOverrideType() != null ? request.getOverrideType() : "NONE")
                .build();

        TimeBlockEntity entity = toEntity(dto);
        TimeBlockEntity saved = repository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public TimeBlockDto updateBlock(Long id, TimeBlockDto updates) {
        TimeBlockEntity existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimeBlock not found with id: " + id));

        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getDetail() != null) existing.setDetail(updates.getDetail());
        if (updates.getStartTime() != null) existing.setStartTime(updates.getStartTime());
        if (updates.getEndTime() != null) existing.setEndTime(updates.getEndTime());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        if (updates.getEnergyLevel() != null) existing.setEnergyLevel(updates.getEnergyLevel());
        if (updates.getPriority() != null) existing.setPriority(updates.getPriority());
        if (updates.getDeadline() != null) existing.setDeadline(updates.getDeadline());
        if (updates.getIsMovable() != null) existing.setIsMovable(updates.getIsMovable());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getInboxDate() != null) existing.setInboxDate(updates.getInboxDate());
        if (updates.getPreferredTimeRange() != null) existing.setPreferredTimeRange(updates.getPreferredTimeRange());
        if (updates.getDate() != null) existing.setDate(updates.getDate());
        if (updates.getSourceType() != null) existing.setSourceType(updates.getSourceType());
        if (updates.getOverrideType() != null) existing.setOverrideType(updates.getOverrideType());
        if (updates.getReminderMinutesBefore() != null) {
            existing.setReminderMinutes(updates.getReminderMinutesBefore().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(",")));
        }
        existing.setIsCompleted(updates.isCompleted());
        if (updates.getMicroSteps() != null) {
            try {
                existing.setMicroStepsJson(objectMapper.writeValueAsString(updates.getMicroSteps()));
            } catch (Exception e) {
                log.error("Failed to serialize micro steps", e);
            }
        }

        return toDto(repository.save(existing));
    }

    @Transactional
    public void deleteBlock(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("TimeBlock not found with id: " + id);
        }
        repository.deleteById(id);
    }

    /**
     * Override / Hủy một routine block trên 1 ngày cụ thể mà không chạm vào template gốc
     */
    @Transactional
    public void cancelRoutineForDate(Long routineId, LocalDate date) {
        List<TimeBlockEntity> existing = repository.findByDateAndSourceRoutineId(date, routineId);
        if (!existing.isEmpty()) {
            TimeBlockEntity entity = existing.get(0);
            entity.setOverrideType("CANCELLED");
            repository.save(entity);
        } else {
            TimeBlockEntity entity = TimeBlockEntity.builder()
                    .title("Cancelled Routine")
                    .startTime("00:00")
                    .endTime("00:00")
                    .category("rest")
                    .energyLevel("low")
                    .date(date)
                    .sourceType("ROUTINE")
                    .sourceRoutineId(routineId)
                    .overrideType("CANCELLED")
                    .build();
            repository.save(entity);
        }
    }

    /**
     * Tạm dừng toàn bộ routine trong một ngày (ví dụ: Nghỉ Lễ Quốc gia)
     */
    @Transactional
    public void pauseAllRoutinesForDate(LocalDate date) {
        List<WeeklyRoutineDto> activeRoutines = weeklyRoutineService.getActiveRoutinesForDay(date.getDayOfWeek());
        for (WeeklyRoutineDto routine : activeRoutines) {
            cancelRoutineForDate(routine.getId(), date);
        }
    }

    /**
     * Khôi phục toàn bộ routine đã bị tạm dừng trong một ngày
     */
    @Transactional
    public void resumeAllRoutinesForDate(LocalDate date) {
        List<TimeBlockEntity> entities = repository.findByDateOrderByStartTimeAsc(date);
        for (TimeBlockEntity entity : entities) {
            if ("CANCELLED".equalsIgnoreCase(entity.getOverrideType()) && "ROUTINE".equalsIgnoreCase(entity.getSourceType())) {
                repository.delete(entity);
            }
        }
    }

    @Transactional
    public List<TimeBlockDto> batchApplyScenario(List<TimeBlockDto> newBlocks) {
        List<TimeBlockEntity> entities = newBlocks.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
        List<TimeBlockEntity> saved = repository.saveAll(entities);
        return saved.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimeBlockDto> getInboxBlocks(LocalDate inboxDate) {
        List<TimeBlockEntity> entities;
        if (inboxDate != null) {
            entities = repository.findByInboxDateAndStatus(inboxDate, "DEFERRED");
        } else {
            entities = repository.findByStatus("DEFERRED");
        }
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public TimeBlockDto scheduleFromInbox(Long blockId, String startTime, String endTime, LocalDate date) {
        TimeBlockEntity entity = repository.findById(blockId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeBlock not found with id: " + blockId));

        entity.setStartTime(startTime);
        entity.setEndTime(endTime);
        entity.setStatus("ACTIVE");
        if (date != null) {
            entity.setDate(date);
        }
        TimeBlockEntity saved = repository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public void purgeAllBlocks() {
        log.info("Purging all TimeBlock entities from database...");
        repository.deleteAll();
    }

    /**
     * Tóm tắt số lượng công việc & ngày lễ cho từng ngày trong 1 tháng
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMonthlySummary(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<HolidayDto> holidays = holidayService.getHolidaysForMonth(year, month);
        Map<LocalDate, HolidayDto> holidayMap = holidays.stream()
                .collect(Collectors.toMap(HolidayDto::getDate, h -> h, (a, b) -> a));

        List<Map<String, Object>> daysSummary = new ArrayList<>();

        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            List<TimeBlockDto> blocks = getBlocksForDate(d);
            HolidayDto holiday = holidayMap.get(d);

            Map<String, Object> dayInfo = new HashMap<>();
            dayInfo.put("date", d.toString());
            dayInfo.put("dayOfWeek", d.getDayOfWeek().toString());
            dayInfo.put("totalTasks", blocks.size());
            dayInfo.put("isHoliday", holiday != null);
            dayInfo.put("holidayName", holiday != null ? holiday.getName() : null);
            dayInfo.put("isStatutory", holiday != null && holiday.isStatutory());
            daysSummary.add(dayInfo);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("month", month);
        result.put("days", daysSummary);
        result.put("holidays", holidays);
        return result;
    }

    // Helper mappers
    public TimeBlockDto toDto(TimeBlockEntity entity) {
        List<Integer> reminders = new ArrayList<>();
        if (entity.getReminderMinutes() != null && !entity.getReminderMinutes().isBlank()) {
            reminders = Arrays.stream(entity.getReminderMinutes().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
        }

        List<TimeBlockDto.MicroStepDto> microSteps = new ArrayList<>();
        if (entity.getMicroStepsJson() != null && !entity.getMicroStepsJson().isBlank()) {
            try {
                microSteps = objectMapper.readValue(entity.getMicroStepsJson(), new TypeReference<>() {});
            } catch (Exception e) {
                log.warn("Failed to deserialize micro steps for block {}", entity.getId());
            }
        }

        return TimeBlockDto.builder()
                .id(entity.getId() != null ? String.valueOf(entity.getId()) : null)
                .title(entity.getTitle())
                .detail(entity.getDetail())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .category(entity.getCategory())
                .energyLevel(entity.getEnergyLevel())
                .priority(entity.getPriority())
                .deadline(entity.getDeadline())
                .isMovable(entity.getIsMovable() != null ? entity.getIsMovable() : true)
                .status(entity.getStatus() != null ? entity.getStatus() : "ACTIVE")
                .inboxDate(entity.getInboxDate())
                .preferredTimeRange(entity.getPreferredTimeRange())
                .reminderMinutesBefore(reminders)
                .isCompleted(Boolean.TRUE.equals(entity.getIsCompleted()))
                .isBufferBlock(Boolean.TRUE.equals(entity.getIsBufferBlock()))
                .microSteps(microSteps)
                .date(entity.getDate())
                .sourceType(entity.getSourceType())
                .sourceRoutineId(entity.getSourceRoutineId())
                .overrideType(entity.getOverrideType())
                .build();
    }

    public TimeBlockEntity toEntity(TimeBlockDto dto) {
        String reminderStr = "";
        if (dto.getReminderMinutesBefore() != null) {
            reminderStr = dto.getReminderMinutesBefore().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
        }

        String microStepsJson = "[]";
        if (dto.getMicroSteps() != null) {
            try {
                microStepsJson = objectMapper.writeValueAsString(dto.getMicroSteps());
            } catch (Exception e) {
                log.warn("Failed to serialize micro steps");
            }
        }

        Long id = null;
        if (dto.getId() != null && !dto.getId().startsWith("routine-")) {
            try {
                id = Long.parseLong(dto.getId());
            } catch (NumberFormatException ignored) {}
        }

        return TimeBlockEntity.builder()
                .id(id)
                .title(dto.getTitle())
                .detail(dto.getDetail())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .category(dto.getCategory() != null ? dto.getCategory() : "work")
                .energyLevel(dto.getEnergyLevel() != null ? dto.getEnergyLevel() : "medium")
                .priority(dto.getPriority() != null ? dto.getPriority() : "Normal")
                .deadline(dto.getDeadline())
                .isMovable(dto.getIsMovable() != null ? dto.getIsMovable() : true)
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .inboxDate(dto.getInboxDate())
                .preferredTimeRange(dto.getPreferredTimeRange())
                .reminderMinutes(reminderStr)
                .isCompleted(dto.isCompleted())
                .isBufferBlock(dto.isBufferBlock())
                .microStepsJson(microStepsJson)
                .date(dto.getDate() != null ? dto.getDate() : LocalDate.now())
                .sourceType(dto.getSourceType() != null ? dto.getSourceType() : "CUSTOM")
                .sourceRoutineId(dto.getSourceRoutineId())
                .overrideType(dto.getOverrideType() != null ? dto.getOverrideType() : "NONE")
                .build();
    }
}
