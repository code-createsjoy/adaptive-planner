package com.adaptive.planner.service;

import com.adaptive.planner.dto.CreateNotificationRequest;
import com.adaptive.planner.dto.NotificationDto;
import com.adaptive.planner.entity.NotificationEntity;
import com.adaptive.planner.exception.ResourceNotFoundException;
import com.adaptive.planner.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationDto> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    @Transactional
    public NotificationDto markAsRead(Long id) {
        NotificationEntity entity = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo với ID: " + id));

        entity.setIsRead(true);
        entity.setReadAt(LocalDateTime.now());
        entity = notificationRepository.save(entity);
        return toDto(entity);
    }

    @Transactional
    public void markAllAsRead() {
        List<NotificationEntity> unreadList = notificationRepository.findAllByIsReadFalseOrderByCreatedAtDesc();
        LocalDateTime now = LocalDateTime.now();
        for (NotificationEntity n : unreadList) {
            n.setIsRead(true);
            n.setReadAt(now);
        }
        notificationRepository.saveAll(unreadList);
    }

    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy thông báo với ID: " + id);
        }
        notificationRepository.deleteById(id);
    }

    @Transactional
    public NotificationDto createNotification(CreateNotificationRequest request) {
        // Deduplication & idempotency check via eventKey
        if (request.getEventKey() != null && !request.getEventKey().trim().isEmpty()) {
            Optional<NotificationEntity> existing = notificationRepository.findByEventKey(request.getEventKey().trim());
            if (existing.isPresent()) {
                log.info("Duplicate notification prevented for eventKey: {}", request.getEventKey());
                return toDto(existing.get());
            }
        }

        NotificationEntity entity = NotificationEntity.builder()
                .userId(request.getUserId() != null ? request.getUserId() : "user-1")
                .type(request.getType())
                .priority(request.getPriority() != null ? request.getPriority() : "NORMAL")
                .title(request.getTitle())
                .message(request.getMessage())
                .relatedEntityType(request.getRelatedEntityType())
                .relatedEntityId(request.getRelatedEntityId())
                .actionType(request.getActionType())
                .actionData(request.getActionData())
                .eventKey(request.getEventKey())
                .scheduledFor(request.getScheduledFor())
                .deliveredAt(request.getDeliveredAt() != null ? request.getDeliveredAt() : LocalDateTime.now())
                .isRead(false)
                .build();

        entity = notificationRepository.save(entity);
        log.info("Notification created [id={}, type={}, title={}]", entity.getId(), entity.getType(), entity.getTitle());
        return toDto(entity);
    }

    private NotificationDto toDto(NotificationEntity entity) {
        return NotificationDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .type(entity.getType())
                .priority(entity.getPriority())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .relatedEntityType(entity.getRelatedEntityType())
                .relatedEntityId(entity.getRelatedEntityId())
                .actionType(entity.getActionType())
                .actionData(entity.getActionData())
                .isRead(entity.getIsRead())
                .readAt(entity.getReadAt())
                .eventKey(entity.getEventKey())
                .scheduledFor(entity.getScheduledFor())
                .deliveredAt(entity.getDeliveredAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
