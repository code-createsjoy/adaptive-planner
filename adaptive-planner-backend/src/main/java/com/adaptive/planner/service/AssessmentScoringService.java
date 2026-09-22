package com.adaptive.planner.service;

import com.adaptive.planner.dto.onboarding.AssessmentSubmissionRequest.AnswerItem;
import com.adaptive.planner.dto.onboarding.FunctionalProfileDto;
import com.adaptive.planner.entity.FunctionalProfileEntity;
import com.adaptive.planner.entity.UserEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AssessmentScoringService {

    public FunctionalProfileEntity scoreAssessment(UserEntity user, List<AnswerItem> answers) {
        Map<String, Integer> answerWeights = answers.stream()
                .collect(Collectors.toMap(AnswerItem::questionId, AnswerItem::scoreWeight, (v1, v2) -> v2));

        // Dimension 1: Task Initiation (Q1, Q2) -> max 6
        int initRaw = getWeight(answerWeights, "Q1") + getWeight(answerWeights, "Q2");
        int initScore = Math.min(100, Math.round((initRaw / 6.0f) * 100));

        // Dimension 2: Attention Regulation (Q3, Q4) -> max 6
        int attRaw = getWeight(answerWeights, "Q3") + getWeight(answerWeights, "Q4");
        int attScore = Math.min(100, Math.round((attRaw / 6.0f) * 100));

        // Dimension 3: Time Awareness (Q5, Q6) -> max 6
        int timeRaw = getWeight(answerWeights, "Q5") + getWeight(answerWeights, "Q6");
        int timeScore = Math.min(100, Math.round((timeRaw / 6.0f) * 100));

        // Dimension 4: Context Switching (Q7, Q8) -> max 6
        int ctxRaw = getWeight(answerWeights, "Q7") + getWeight(answerWeights, "Q8");
        int ctxScore = Math.min(100, Math.round((ctxRaw / 6.0f) * 100));

        // Dimension 5: Sensory Sensitivity (Q9, Q10) -> max 6
        int sensoryRaw = getWeight(answerWeights, "Q9") + getWeight(answerWeights, "Q10");
        int sensoryScore = Math.min(100, Math.round((sensoryRaw / 6.0f) * 100));

        // Dimension 6: Need for Structure (Q11) -> max 3
        int structRaw = getWeight(answerWeights, "Q11");
        int structScore = Math.min(100, Math.round((structRaw / 3.0f) * 100));

        // Communication preference from Q12
        int commRaw = getWeight(answerWeights, "Q12");
        String commPref = switch (commRaw) {
            case 3 -> "VISUAL_AND_CHECKLIST";
            case 2 -> "STEP_BY_STEP_CHECKLIST";
            case 1 -> "DETAILED_WRITTEN";
            default -> "SHORT_AND_DIRECT";
        };

        // Recommended Mode
        String recommendedMode = "BALANCED";
        if (sensoryScore >= 65) {
            recommendedMode = "CALM";
        } else if (attScore >= 65) {
            recommendedMode = "FOCUS";
        }

        return FunctionalProfileEntity.builder()
                .user(user)
                .taskInitiationScore(initScore)
                .attentionRegulationScore(attScore)
                .timeAwarenessScore(timeScore)
                .contextSwitchingScore(ctxScore)
                .sensorySensitivityScore(sensoryScore)
                .needForStructureScore(structScore)
                .communicationPreference(commPref)
                .recommendedMode(recommendedMode)
                .assessmentCompleted(true)
                .build();
    }

    public List<String> generateNoticedPatterns(FunctionalProfileEntity profile) {
        List<String> patterns = new ArrayList<>();

        if (profile.getTaskInitiationScore() >= 60) {
            patterns.add("Bạn có thể hưởng lợi từ việc chia nhỏ công việc thành các bước vi mô 2–5 phút (Magic Task Breakdown).");
        }
        if (profile.getAttentionRegulationScore() >= 60) {
            patterns.add("Môi trường làm việc ít thông báo xao nhãng và chế độ Tập trung (Focus Mode) sẽ hỗ trợ duy trì luồng tư duy sâu.");
        }
        if (profile.getTimeAwarenessScore() >= 60) {
            patterns.add("Thanh chỉ báo thời gian trực quan và cảnh báo chuyển tiếp T-10m giúp bạn kiểm soát tiến độ tự nhiên mà không bị tê liệt chờ đợi.");
        }
        if (profile.getContextSwitchingScore() >= 60) {
            patterns.add("Việc gộp các công việc cùng loại và đặt vùng đệm 10–15 phút giữa các cuộc họp giúp giảm áp lực chuyển đổi trạng thái.");
        }
        if (profile.getSensorySensitivityScore() >= 60) {
            patterns.add("Giao diện êm dịu (Calm Mode) với mật độ thị giác thấp giúp bảo vệ năng lượng não bộ suốt cả ngày.");
        }
        if (profile.getNeedForStructureScore() >= 60) {
            patterns.add("Thời khóa biểu cố định và danh sách việc Now/Next rõ ràng mang lại sự an tâm và định hướng vững chắc.");
        }

        if (patterns.isEmpty()) {
            patterns.add("Bạn duy trì sự cân bằng tương đối tốt giữa các chiều hoạt động. Modo sẽ hỗ trợ giữ vững nhịp sinh hoạt tự nhiên của bạn.");
        }

        return patterns;
    }

    private int getWeight(Map<String, Integer> map, String questionId) {
        return map.getOrDefault(questionId, 1);
    }
}
