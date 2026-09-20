package com.adaptive.planner.controller;

import com.adaptive.planner.dto.HolidayDto;
import com.adaptive.planner.service.HolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayService holidayService;

    @GetMapping
    public ResponseEntity<List<HolidayDto>> getHolidays(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        if (month != null) {
            return ResponseEntity.ok(holidayService.getHolidaysForMonth(targetYear, month));
        }
        return ResponseEntity.ok(holidayService.getHolidaysForYear(targetYear));
    }

    @GetMapping("/check")
    public ResponseEntity<HolidayDto> checkHoliday(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return holidayService.getHolidayForDate(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
