package com.adaptive.planner.service;

import com.adaptive.planner.dto.AppendMessageRequest;
import com.adaptive.planner.dto.ChatMessageDto;
import com.adaptive.planner.dto.ConversationDto;
import com.adaptive.planner.dto.CreateConversationRequest;
import com.adaptive.planner.entity.ChatMessageEntity;
import com.adaptive.planner.entity.ConversationEntity;
import com.adaptive.planner.repository.ChatMessageRepository;
import com.adaptive.planner.repository.ConversationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConversationServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @InjectMocks
    private ConversationService conversationService;

    @Test
    @DisplayName("createConversation creates conversation and initial message")
    void testCreateConversation() {
        ChatMessageDto initialMsg = ChatMessageDto.builder()
                .role("user")
                .content("Hôm nay có cuộc họp đột xuất lúc 19:00")
                .build();

        CreateConversationRequest request = CreateConversationRequest.builder()
                .title("Lịch họp đột xuất")
                .initialMessage(initialMsg)
                .build();

        ConversationEntity entity = ConversationEntity.builder()
                .id(1L)
                .title("Lịch họp đột xuất")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .messages(new ArrayList<>())
                .build();

        ChatMessageEntity msgEntity = ChatMessageEntity.builder()
                .id(10L)
                .conversation(entity)
                .role("user")
                .content("Hôm nay có cuộc họp đột xuất lúc 19:00")
                .createdAt(LocalDateTime.now())
                .build();
        entity.getMessages().add(msgEntity);

        when(conversationRepository.save(any(ConversationEntity.class))).thenReturn(entity);

        ConversationDto result = conversationService.createConversation(request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Lịch họp đột xuất");
        assertThat(result.getMessages()).hasSize(1);
        assertThat(result.getMessages().get(0).getContent()).isEqualTo("Hôm nay có cuộc họp đột xuất lúc 19:00");
    }

    @Test
    @DisplayName("getConversations returns summary list ordered by updatedAt DESC")
    void testGetConversations() {
        ConversationEntity entity = ConversationEntity.builder()
                .id(1L)
                .title("Học tập buổi tối")
                .createdAt(LocalDateTime.now().minusHours(2))
                .updatedAt(LocalDateTime.now())
                .messages(List.of(
                        ChatMessageEntity.builder()
                                .id(1L)
                                .role("assistant")
                                .content("Đã điều chỉnh lịch học sang 20:00")
                                .build()
                ))
                .build();

        when(conversationRepository.findAllByOrderByUpdatedAtDesc()).thenReturn(List.of(entity));

        List<ConversationDto> list = conversationService.getConversations();

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getTitle()).isEqualTo("Học tập buổi tối");
        assertThat(list.get(0).getLastMessagePreview()).isEqualTo("Đã điều chỉnh lịch học sang 20:00");
    }

    @Test
    @DisplayName("appendMessage adds message and touches conversation")
    void testAppendMessage() {
        ConversationEntity conv = ConversationEntity.builder()
                .id(1L)
                .title("Cuộc trò chuyện mới")
                .messages(new ArrayList<>())
                .build();

        when(conversationRepository.findById(1L)).thenReturn(Optional.of(conv));

        ChatMessageEntity savedMsg = ChatMessageEntity.builder()
                .id(5L)
                .conversation(conv)
                .role("user")
                .content("Tôi muốn đổi giờ tập gym")
                .createdAt(LocalDateTime.now())
                .build();

        when(chatMessageRepository.save(any(ChatMessageEntity.class))).thenReturn(savedMsg);

        AppendMessageRequest req = AppendMessageRequest.builder()
                .role("user")
                .content("Tôi muốn đổi giờ tập gym")
                .build();

        ChatMessageDto result = conversationService.appendMessage(1L, req);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo("Tôi muốn đổi giờ tập gym");
        verify(conversationRepository).save(conv);
    }
}
