package com.adaptive.planner.dto.onboarding;

import java.util.List;

public record NeurodivergenceSelfIdRequest(
        String identificationStatus, // DIAGNOSED, SELF_IDENTIFIED, EXPLORING, NEUROTYPICAL, UNSURE, PREFER_NOT_TO_SAY
        List<String> selectedConditions // ADHD, Autism, Dyslexia, Dyspraxia, Dyscalculia, Tourette, Other
) {}
