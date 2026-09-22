package com.adaptive.planner.service;

import com.adaptive.planner.dto.TimeBlockDto;
import com.adaptive.planner.entity.TimeBlockEntity;
import com.adaptive.planner.entity.WeeklyRoutineEntity;
import com.adaptive.planner.exception.ConflictException;
import com.adaptive.planner.repository.TimeBlockRepository;
import com.adaptive.planner.repository.WeeklyRoutineRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.LockModeType;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.repository.Lock;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TimeBlockServiceCompletionTest {

    @Mock
    private TimeBlockRepository repository;
    @Mock
    private WeeklyRoutineService weeklyRoutineService;
    @Mock
    private WeeklyRoutineRepository weeklyRoutineRepository;
    @Mock
    private HolidayService holidayService;

    private TimeBlockService service;

    @BeforeEach
    void setUp() {
        service = new TimeBlockService(
                repository,
                weeklyRoutineService,
                weeklyRoutineRepository,
                holidayService,
                new ObjectMapper(),
                Clock.fixed(Instant.parse("2026-09-21T02:00:00Z"), ZoneOffset.UTC)
        );
    }

    @Test
    void customCompletionIsPersistedAndIdempotent() {
        TimeBlockEntity block = customBlock(41L, false);
        when(repository.findById(41L)).thenReturn(Optional.of(block));
        when(repository.save(any(TimeBlockEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TimeBlockDto first = service.updateCompletion(41L, true);
        TimeBlockDto second = service.updateCompletion(41L, true);

        assertTrue(first.isCompleted());
        assertTrue(second.isCompleted());
        assertTrue(block.getIsCompleted());
        verify(repository, times(2)).save(same(block));
    }

    @Test
    void customCancelledOccurrenceCannotBeRevived() {
        TimeBlockEntity cancelled = customBlock(42L, false);
        cancelled.setOverrideType("CANCELLED");
        when(repository.findById(42L)).thenReturn(Optional.of(cancelled));

        assertThrows(ConflictException.class, () -> service.updateCompletion(42L, true));

        assertFalse(cancelled.getIsCompleted());
        verify(repository, never()).save(any());
    }

    @Test
    void routineCompletionMaterializesDateScopedOccurrenceFromTemplate() {
        LocalDate date = LocalDate.of(2026, 9, 21);
        WeeklyRoutineEntity routine = routine(7L, DayOfWeek.MONDAY);
        when(weeklyRoutineRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(routine));
        when(repository.findFirstBySourceRoutineIdAndDate(7L, date)).thenReturn(Optional.empty());
        when(repository.saveAndFlush(any(TimeBlockEntity.class))).thenAnswer(invocation -> {
            TimeBlockEntity saved = invocation.getArgument(0);
            saved.setId(501L);
            return saved;
        });

        TimeBlockDto result = service.updateRoutineOccurrenceCompletion(7L, date, true);

        assertEquals("501", result.getId());
        assertEquals("Deep work", result.getTitle());
        assertEquals(date, result.getDate());
        assertEquals("ROUTINE", result.getSourceType());
        assertEquals(7L, result.getSourceRoutineId());
        assertEquals("MODIFIED", result.getOverrideType());
        assertTrue(result.isCompleted());
        verify(weeklyRoutineRepository).findByIdForUpdate(7L);
    }

    @Test
    void repeatRoutineCompletionReusesOccurrenceAndStableId() {
        LocalDate date = LocalDate.of(2026, 9, 21);
        WeeklyRoutineEntity routine = routine(7L, DayOfWeek.MONDAY);
        TimeBlockEntity occurrence = routineOccurrence(501L, 7L, date, true, "MODIFIED");
        when(weeklyRoutineRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(routine));
        when(repository.findFirstBySourceRoutineIdAndDate(7L, date)).thenReturn(Optional.of(occurrence));
        when(repository.saveAndFlush(any(TimeBlockEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TimeBlockDto result = service.updateRoutineOccurrenceCompletion(7L, date, true);

        assertEquals("501", result.getId());
        assertTrue(result.isCompleted());
        verify(repository).saveAndFlush(same(occurrence));
    }

    @Test
    void routineOccurrenceCanBeUncompleted() {
        LocalDate date = LocalDate.of(2026, 9, 21);
        WeeklyRoutineEntity routine = routine(7L, DayOfWeek.MONDAY);
        TimeBlockEntity occurrence = routineOccurrence(501L, 7L, date, true, "MODIFIED");
        when(weeklyRoutineRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(routine));
        when(repository.findFirstBySourceRoutineIdAndDate(7L, date)).thenReturn(Optional.of(occurrence));
        when(repository.saveAndFlush(any(TimeBlockEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TimeBlockDto result = service.updateRoutineOccurrenceCompletion(7L, date, false);

        assertFalse(result.isCompleted());
        assertFalse(occurrence.getIsCompleted());
    }

    @Test
    void cancelledRoutineOccurrenceIsRejectedWithoutMutation() {
        LocalDate date = LocalDate.of(2026, 9, 21);
        WeeklyRoutineEntity routine = routine(7L, DayOfWeek.MONDAY);
        TimeBlockEntity occurrence = routineOccurrence(501L, 7L, date, false, "CANCELLED");
        when(weeklyRoutineRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(routine));
        when(repository.findFirstBySourceRoutineIdAndDate(7L, date)).thenReturn(Optional.of(occurrence));

        assertThrows(
                ConflictException.class,
                () -> service.updateRoutineOccurrenceCompletion(7L, date, true)
        );

        assertFalse(occurrence.getIsCompleted());
        assertEquals("CANCELLED", occurrence.getOverrideType());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void sameRoutineOnTwoDatesCreatesTwoIndependentEvidenceIds() {
        WeeklyRoutineEntity routine = routine(7L, DayOfWeek.MONDAY);
        LocalDate firstDate = LocalDate.of(2026, 9, 21);
        LocalDate secondDate = LocalDate.of(2026, 9, 28);
        when(weeklyRoutineRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(routine));
        when(repository.findFirstBySourceRoutineIdAndDate(eq(7L), any(LocalDate.class)))
                .thenReturn(Optional.empty());
        AtomicLong ids = new AtomicLong(500L);
        when(repository.saveAndFlush(any(TimeBlockEntity.class))).thenAnswer(invocation -> {
            TimeBlockEntity saved = invocation.getArgument(0);
            saved.setId(ids.incrementAndGet());
            return saved;
        });

        TimeBlockDto first = service.updateRoutineOccurrenceCompletion(7L, firstDate, true);
        TimeBlockDto second = service.updateRoutineOccurrenceCompletion(7L, secondDate, true);

        assertEquals(firstDate, first.getDate());
        assertEquals(secondDate, second.getDate());
        assertNotEquals(first.getId(), second.getId());
        verify(repository).findFirstBySourceRoutineIdAndDate(7L, firstDate);
        verify(repository).findFirstBySourceRoutineIdAndDate(7L, secondDate);
    }

    @Test
    void inactiveOrWrongWeekdayRoutineIsRejectedBeforeLookup() {
        LocalDate monday = LocalDate.of(2026, 9, 21);
        WeeklyRoutineEntity disabled = routine(7L, DayOfWeek.MONDAY);
        disabled.setEnabled(false);
        when(weeklyRoutineRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(disabled));

        assertThrows(
                ConflictException.class,
                () -> service.updateRoutineOccurrenceCompletion(7L, monday, true)
        );
        verify(repository, never()).findFirstBySourceRoutineIdAndDate(anyLong(), any());

        WeeklyRoutineEntity tuesday = routine(8L, DayOfWeek.TUESDAY);
        when(weeklyRoutineRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(tuesday));
        assertThrows(
                ConflictException.class,
                () -> service.updateRoutineOccurrenceCompletion(8L, monday, true)
        );
    }

    @Test
    void databaseMappingDeclaresRoutineAndDateUniqueness() {
        Table table = TimeBlockEntity.class.getAnnotation(Table.class);

        assertNotNull(table);
        assertTrue(Arrays.stream(table.uniqueConstraints())
                .map(UniqueConstraint::columnNames)
                .anyMatch(columns -> Arrays.equals(
                        new String[]{"source_routine_id", "event_date"},
                        columns
                )));
    }

    @Test
    void routineLookupUsesPessimisticWriteLockToSerializeFirstMaterialization() throws Exception {
        Lock lock = WeeklyRoutineRepository.class
                .getMethod("findByIdForUpdate", Long.class)
                .getAnnotation(Lock.class);

        assertNotNull(lock);
        assertEquals(LockModeType.PESSIMISTIC_WRITE, lock.value());
    }

    private TimeBlockEntity customBlock(Long id, boolean completed) {
        return TimeBlockEntity.builder()
                .id(id)
                .title("Custom task")
                .startTime("09:00")
                .endTime("10:00")
                .category("work")
                .energyLevel("medium")
                .isCompleted(completed)
                .date(LocalDate.of(2026, 9, 21))
                .sourceType("CUSTOM")
                .overrideType("NONE")
                .microStepsJson("[]")
                .build();
    }

    private WeeklyRoutineEntity routine(Long id, DayOfWeek dayOfWeek) {
        return WeeklyRoutineEntity.builder()
                .id(id)
                .dayOfWeek(dayOfWeek)
                .title("Deep work")
                .detail("Focused session")
                .startTime("09:00")
                .endTime("10:30")
                .category("work")
                .energyLevel("high")
                .priority("High")
                .reminderMinutes("10,0")
                .enabled(true)
                .build();
    }

    private TimeBlockEntity routineOccurrence(
            Long id,
            Long routineId,
            LocalDate date,
            boolean completed,
            String overrideType
    ) {
        TimeBlockEntity occurrence = customBlock(id, completed);
        occurrence.setTitle("Deep work");
        occurrence.setDate(date);
        occurrence.setSourceType("ROUTINE");
        occurrence.setSourceRoutineId(routineId);
        occurrence.setOverrideType(overrideType);
        return occurrence;
    }
}
