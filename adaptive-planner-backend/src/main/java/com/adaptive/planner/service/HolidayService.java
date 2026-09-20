package com.adaptive.planner.service;

import com.adaptive.planner.dto.HolidayDto;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HolidayService {

    public List<HolidayDto> getHolidaysForYear(int year) {
        List<HolidayDto> holidays = new ArrayList<>();

        // Solar Holidays (Cố định Dương lịch)
        holidays.add(HolidayDto.builder()
                .date(LocalDate.of(year, 1, 1))
                .name("Tết Dương Lịch")
                .englishName("New Year's Day")
                .isStatutory(true)
                .description("Nghỉ Tết Dương Lịch toàn quốc")
                .build());

        holidays.add(HolidayDto.builder()
                .date(LocalDate.of(year, 4, 30))
                .name("Ngày Giải phóng Miền Nam")
                .englishName("Reunification Day")
                .isStatutory(true)
                .description("Ngày Chiến thắng 30/4")
                .build());

        holidays.add(HolidayDto.builder()
                .date(LocalDate.of(year, 5, 1))
                .name("Ngày Quốc tế Lao động")
                .englishName("International Workers' Day")
                .isStatutory(true)
                .description("Kỳ nghỉ Quốc tế Lao động 1/5")
                .build());

        holidays.add(HolidayDto.builder()
                .date(LocalDate.of(year, 9, 2))
                .name("Ngày Quốc khánh Việt Nam")
                .englishName("Vietnam National Day")
                .isStatutory(true)
                .description("Kỷ niệm ngày Quốc khánh 2/9")
                .build());

        // Ngày liền kề Quốc khánh
        holidays.add(HolidayDto.builder()
                .date(LocalDate.of(year, 9, 3))
                .name("Nghỉ lễ Quốc khánh (Bổ sung)")
                .englishName("National Day Holiday")
                .isStatutory(true)
                .description("Kỳ nghỉ Quốc khánh bổ sung theo luật lao động")
                .build());

        // Lunar Statutory Holidays for 2024-2030
        addLunarHolidays(holidays, year);

        holidays.sort(Comparator.comparing(HolidayDto::getDate));
        return holidays;
    }

    public List<HolidayDto> getHolidaysForMonth(int year, int month) {
        return getHolidaysForYear(year).stream()
                .filter(h -> h.getDate().getMonthValue() == month)
                .collect(Collectors.toList());
    }

    public Optional<HolidayDto> getHolidayForDate(LocalDate date) {
        return getHolidaysForYear(date.getYear()).stream()
                .filter(h -> h.getDate().equals(date))
                .findFirst();
    }

    private void addLunarHolidays(List<HolidayDto> list, int year) {
        if (year == 2024) {
            addTetRange(list, LocalDate.of(2024, 2, 8), 7);
            list.add(createHungKingHoliday(LocalDate.of(2024, 4, 18)));
        } else if (year == 2025) {
            addTetRange(list, LocalDate.of(2025, 1, 28), 7);
            list.add(createHungKingHoliday(LocalDate.of(2025, 4, 7)));
        } else if (year == 2026) {
            addTetRange(list, LocalDate.of(2026, 2, 16), 7);
            list.add(createHungKingHoliday(LocalDate.of(2026, 4, 26)));
        } else if (year == 2027) {
            addTetRange(list, LocalDate.of(2027, 2, 5), 7);
            list.add(createHungKingHoliday(LocalDate.of(2027, 4, 16)));
        } else if (year == 2028) {
            addTetRange(list, LocalDate.of(2028, 1, 25), 7);
            list.add(createHungKingHoliday(LocalDate.of(2028, 4, 4)));
        } else if (year == 2029) {
            addTetRange(list, LocalDate.of(2029, 2, 12), 7);
            list.add(createHungKingHoliday(LocalDate.of(2029, 4, 22)));
        } else if (year == 2030) {
            addTetRange(list, LocalDate.of(2030, 2, 2), 7);
            list.add(createHungKingHoliday(LocalDate.of(2030, 4, 11)));
        }
    }

    private void addTetRange(List<HolidayDto> list, LocalDate startDate, int days) {
        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            String title = (i == 0) ? "29/30 Tết (Giao thừa)" : "Tết Nguyên Đán (Mùng " + i + ")";
            list.add(HolidayDto.builder()
                    .date(date)
                    .name(title)
                    .englishName("Lunar New Year Holiday")
                    .lunarDate("Tháng Giêng")
                    .isStatutory(true)
                    .description("Kỳ nghỉ Tết Âm Lịch truyền thống")
                    .build());
        }
    }

    private HolidayDto createHungKingHoliday(LocalDate date) {
        return HolidayDto.builder()
                .date(date)
                .name("Giỗ Tổ Hùng Vương (10/3 Âm lịch)")
                .englishName("Hung Kings Commemoration Day")
                .lunarDate("10/03 Âm lịch")
                .isStatutory(true)
                .description("Lễ hội đền Hùng toàn quốc")
                .build();
    }
}
