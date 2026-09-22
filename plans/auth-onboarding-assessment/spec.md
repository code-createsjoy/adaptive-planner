# Spec: Authentication, Onboarding, Multi-Tier Roles & Functional Assessment

## 1. Context & Objectives
Build a complete, neurodivergent-friendly authentication, onboarding, role separation, and functional assessment experience for Modo.
The system guarantees that:
- Authentication, Authorization Role, Journey Stage, Neurodivergence Self-ID, and Functional Accessibility Profile are strictly decoupled.
- The signup process is lightweight (Name, Email, Password) with zero diagnosis/intrusive questions.
- Onboarding is progressive (1 card/question per step) and empowers the user with immediate dashboard personalization.
- Assessments are functional and deterministic, never providing medical diagnosis probabilities.
- B2B Organization entities and invitation tokens are architected cleanly for future B2B expansion.

---

## 2. User Stories

### Story 1: Lightweight Public Sign Up & Login with JWT Cookies (P0)
**As a** new user,  
**I want** to register with only my name, email, and password, and log in securely,  
**So that** I can access Modo with minimal cognitive friction and secure token management.

- **Acceptance Criteria**:
  - `POST /api/auth/signup` creates a user with `PERSONAL_USER` role and hashed password (BCrypt).
  - `POST /api/auth/login` validates credentials, issues Access Token (15 min) and Refresh Token (7 days) in HTTP-only cookies.
  - `GET /api/auth/me` returns current user identity, onboarding status, and platform role.
  - `POST /api/auth/logout` revokes the refresh token and clears cookies.

### Story 2: First-Time Personal Onboarding State Machine (P0)
**As a** newly registered user logging in for the first time,  
**I want** to be guided through a calm, step-by-step onboarding (Welcome $\rightarrow$ Journey Stage $\rightarrow$ Neurodivergence Self-ID),  
**So that** Modo understands my context without overwhelming me with large forms.

- **Acceptance Criteria**:
  - `onboardingCompleted` flag controls whether user is shown onboarding or dashboard.
  - Steps are numbered (`Step 1 of 4`) with clear Back and "Set up later" options.
  - Journey stage is saved to `journeyStage` (e.g. `STUDYING`, `JOB_SEARCHING`, `CURRENTLY_WORKING`).
  - Neurodivergence self-identification is stored privately.

### Story 3: Optional 12–14 Question Functional Assessment & Scored Profile (P0)
**As a** user who chooses to explore their working patterns,  
**I want** to answer 12–14 functional questions about attention, task initiation, time awareness, and sensory needs,  
**So that** Modo generates a personalized Functional Profile with non-medical pattern descriptions.

- **Acceptance Criteria**:
  - Questions are scored across 6 dimensions (Attention, Task Initiation, Time Awareness, Context Switching, Sensory Sensitivity, Need for Structure).
  - Deterministic formula computes dimension scores (0–100) and support tiers (`Low`, `Moderate`, `High`).
  - Screen displays "Your Modo Profile" with empathetic pattern callouts and medical disclaimer.

### Story 4: Instant Dashboard Personalization (P0)
**As an** onboarded user landing on the dashboard,  
**I want** the UI density, Now/Next prioritization, and focus tools to match my Functional Profile,  
**So that** the platform adapts to my actual cognitive needs from day one.

- **Acceptance Criteria**:
  - High task initiation support automatically emphasizes "Break this task down".
  - High sensory sensitivity enables Calm mode styling and reduced animation density.
  - Future logins skip onboarding and retain personalization preferences.

### Story 5: B2B Organization & Invitation Domain Foundation (P1)
**As an** organization administrator,  
**I want** to invite team members via secure token links that assign specific roles (`EMPLOYEE`, `MANAGER`, `HR`),  
**So that** business accounts can be provisioned cleanly without conflating personal user roles.

- **Acceptance Criteria**:
  - `OrganizationEntity`, `OrganizationMemberEntity`, and `OrganizationInvitationEntity` exist with valid foreign keys.
  - Public signup can never self-promote to `ORG_ADMIN` or `MANAGER`.

---

## 3. Data Models & API Specifications

### Database Schema

```sql
-- Users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    platform_role VARCHAR(50) DEFAULT 'PERSONAL_USER', -- PERSONAL_USER, PLATFORM_ADMIN
    journey_stage VARCHAR(50), -- STUDYING, EXPLORING_CAREERS, JOB_SEARCHING, CURRENTLY_WORKING, etc.
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Private Neurodivergence Self-ID
CREATE TABLE neurodivergence_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    identification_status VARCHAR(100), -- DIAGNOSED, SELF_IDENTIFIED, EXPLORING, NEUROTYPICAL, UNSURE, PREFER_NOT_TO_SAY
    selected_conditions_json TEXT, -- JSON array: ["ADHD", "Autism", "Dyslexia"]
    is_private BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Functional Accessibility Profiles
CREATE TABLE functional_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    attention_regulation_score INT DEFAULT 50,
    task_initiation_score INT DEFAULT 50,
    time_awareness_score INT DEFAULT 50,
    context_switching_score INT DEFAULT 50,
    sensory_sensitivity_score INT DEFAULT 50,
    need_for_structure_score INT DEFAULT 50,
    communication_preference VARCHAR(100) DEFAULT 'WRITTEN_STEP_BY_STEP',
    instruction_preference VARCHAR(100) DEFAULT 'VISUAL_AND_CHECKLIST',
    recommended_mode VARCHAR(50) DEFAULT 'BALANCED', -- CALM, BALANCED, FOCUS
    assessment_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- B2B Organization & Memberships
CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organization_members (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- EMPLOYEE, MANAGER, HR, ORG_ADMIN
    status VARCHAR(50) DEFAULT 'ACTIVE',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, organization_id)
);

CREATE TABLE organization_invitations (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    invited_role VARCHAR(50) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING'
);
```

### Key API Endpoints

1. `POST /api/auth/signup` $\rightarrow$ `{ id, email, name }`
2. `POST /api/auth/login` $\rightarrow$ `{ id, email, name, onboardingCompleted }` + Set-Cookie (`access_token`, `refresh_token`)
3. `POST /api/auth/refresh` $\rightarrow$ Rotates tokens + Set-Cookie
4. `POST /api/auth/logout` $\rightarrow$ Clears cookies & revokes refresh token
5. `GET /api/auth/me` $\rightarrow$ User session info + `onboardingCompleted` + `journeyStage`
6. `POST /api/onboarding/journey-stage` $\rightarrow$ Sets `journeyStage`
7. `POST /api/onboarding/neurodivergence-self-id` $\rightarrow$ Saves private self-ID
8. `POST /api/onboarding/assessment/submit` $\rightarrow$ Evaluates answers and stores `FunctionalProfile`
9. `POST /api/onboarding/complete` $\rightarrow$ Sets `onboardingCompleted = true`
10. `GET /api/onboarding/functional-profile` $\rightarrow$ Retrieves active functional profile & UI settings

---

## 4. Assessment Inventory (12 Questions) & Scoring Logic

| # | Dimension | Question Text | Options & Weights (0–3) |
|---|---|---|---|
| Q1 | Task Initiation | Khi bắt đầu một đầu việc không tạo nhiều hứng thú: | 0: Bắt đầu dễ dàng, 1: Đôi khi trì hoãn, 2: Thường khó bắt đầu, 3: Tránh né đến sát hạn chót |
| Q2 | Task Initiation | Bạn cảm thấy thế nào trước một dự án lớn chưa rõ từng bước? | 0: Tự chia nhỏ được, 1: Cần suy nghĩ một lát, 2: Dễ choáng ngợp, 3: Bị tê liệt không biết bắt đầu từ đâu |
| Q3 | Attention Regulation | Trong các buổi làm việc cần tập trung kéo dài: | 0: Duy trì tốt, 1: Thỉnh thoảng xao nhãng, 2: Rất dễ bị phân tán, 3: Hyperfocus quên cả thời gian |
| Q4 | Attention Regulation | Khi có âm thanh hoặc thông báo bất ngờ xung quanh: | 0: Bỏ qua dễ dàng, 1: Hơi chú ý, 2: Mất tập trung ngay, 3: Rất khó để quay lại luồng việc |
| Q5 | Time Awareness | Mức độ nhận biết dòng chảy thời gian khi đang làm việc: | 0: Luôn ước lượng chuẩn, 1: Khá chuẩn, 2: Thường đánh giá thấp thời gian, 3: Thường xuyên mất khái niệm thời gian |
| Q6 | Time Awareness | Trước các hạn chót hoặc giờ hẹn kế tiếp: | 0: Chủ động chuẩn bị, 1: Đôi khi gấp gáp, 2: Thường xuyên rơi vào trạng thái chờ đợi tê liệt, 3: Hay bị trễ nếu không có chuông báo |
| Q7 | Context Switching | Chuyển đổi đột ngột giữa 2 công việc khác nhau tạo cảm giác: | 0: Bình thường, 1: Cần 5-10p làm quen, 2: Mệt mỏi và phân tâm, 3: Cực kỳ quá tải và kiệt sức |
| Q8 | Context Switching | Những ngày có nhiều cuộc họp xen kẽ nhau: | 0: Vẫn làm việc tốt, 1: Hơi mệt, 2: Khó tập trung làm việc sâu, 3: Làm cạn kiệt năng lượng cả ngày |
| Q9 | Sensory Sensitivity | Môi trường ánh sáng mạnh, tiếng ồn hoặc nhiều kích thích thị giác: | 0: Không ảnh hưởng, 1: Hơi khó chịu, 2: Giảm đáng kể sự tập trung, 3: Gây kiệt sức nhanh chóng |
| Q10 | Sensory Sensitivity | Khi ứng dụng có quá nhiều màu sắc, biểu tượng hoặc chuyển động: | 0: Thấy sinh động, 1: Bình thường, 2: Thấy rối mắt, 3: Cần giao diện tối giản, êm dịu (Calm) |
| Q11 | Need for Structure | Mức độ bạn cần một thời khóa biểu và thứ tự ưu tiên rõ ràng: | 0: Thích tự do linh hoạt, 1: Cần khung giờ đại khái, 2: Cần danh sách rõ ràng, 3: Rất cần lịch trình chi tiết từng khung giờ |
| Q12 | Communication Preference | Bạn thích nhận hướng dẫn hoặc giao việc theo cách nào? | 0: Trao đổi ngắn gọn, 1: Văn bản chi tiết, 2: Từng bước nhỏ kèm checklist, 3: Ví dụ trực quan & checklist |

---

## 5. Acceptance Criteria & Success Verification
- **Unit & Integration Tests**:
  - `AuthServiceTest`: Signup, password hashing, JWT creation, token rotation, logout.
  - `AssessmentScoringServiceTest`: Correct calculation of 6 functional dimensions and support levels.
- **Frontend Verification**:
  - Complete flow: Sign up $\rightarrow$ Login $\rightarrow$ Onboarding Step 1-4 $\rightarrow$ Assessment (or Skip) $\rightarrow$ Profile Reveal $\rightarrow$ Dashboard immediately adapted.
  - Subsequent reload or login directly loads the personalized dashboard without re-triggering onboarding.
- **Privacy Assurance**: Private self-id and assessment scores are isolated from organization sharing models.
