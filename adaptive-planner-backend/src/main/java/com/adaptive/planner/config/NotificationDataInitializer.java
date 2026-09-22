package com.adaptive.planner.config;

import com.adaptive.planner.entity.NotificationEntity;
import com.adaptive.planner.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationDataInitializer implements CommandLineRunner {

    private final NotificationRepository notificationRepository;

    @Override
    public void run(String... args) {
        if (notificationRepository.count() == 0) {
            log.info("Seeding initial notifications for demo user...");
            NotificationEntity n1 = NotificationEntity.builder()
                    .userId("user-1")
                    .type("AI_SUGGESTION")
                    .priority("NORMAL")
                    .title("Welcome to Adaptive Planner!")
                    .message("Modo is ready to support you. The system will automatically protect transition buffers and notify you when schedule conflicts arise.")
                    .eventKey("welcome-notification-user-1")
                    .actionType("OPEN_SESSION")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            NotificationEntity n2 = NotificationEntity.builder()
                    .userId("user-1")
                    .type("REBALANCE_AVAILABLE")
                    .priority("HIGH")
                    .title("Schedule Rebalance Recommendation")
                    .message("You have multiple consecutive focus blocks today. Modo prepared a gentle 15-minute buffer plan to protect cognitive stamina.")
                    .eventKey("rebalance-tip-user-1")
                    .actionType("VIEW_REBALANCE")
                    .isRead(false)
                    .createdAt(LocalDateTime.now().minusMinutes(45))
                    .build();

            NotificationEntity n3 = NotificationEntity.builder()
                    .userId("user-1")
                    .type("BLOCK_STARTING")
                    .priority("NORMAL")
                    .title("Reminder: Deep Focus session starting soon")
                    .message("Your 09:00 focus session starts in 10 minutes. Prepare your workspace and a glass of water.")
                    .eventKey("task-reminder-user-1")
                    .actionType("OPEN_SESSION")
                    .isRead(true)
                    .readAt(LocalDateTime.now().minusHours(2))
                    .createdAt(LocalDateTime.now().minusHours(3))
                    .build();

            notificationRepository.saveAll(List.of(n1, n2, n3));
            log.info("Successfully seeded starter notifications.");
        }
    }
}
